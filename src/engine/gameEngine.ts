import {
  GameState,
  GameStats,
  DecisionCard,
  DelayedConsequence,
  ChronicleRecord,
  BillProposal,
  ActionableProposal,
  SideAgreement,
  AdvisorId
} from '../types/game';

// Clamp helper for bounded stats
function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export class GameEngine {
  /**
   * Apply stat adjustments cleanly with safety boundaries
   */
  static applyStatChanges(stats: GameStats, changes: Partial<GameStats>): GameStats {
    const updated = { ...stats };

    if (changes.treasuryBillion !== undefined) {
      updated.treasuryBillion = Math.round((updated.treasuryBillion + changes.treasuryBillion) * 10) / 10;
    }
    if (changes.debtBillion !== undefined) {
      updated.debtBillion = Math.round((updated.debtBillion + changes.debtBillion) * 10) / 10;
    }
    if (changes.gdpGrowthPct !== undefined) {
      updated.gdpGrowthPct = Math.round((updated.gdpGrowthPct + changes.gdpGrowthPct) * 10) / 10;
    }
    if (changes.inflationPct !== undefined) {
      updated.inflationPct = Math.round(clamp(updated.inflationPct + changes.inflationPct, 0.5, 35) * 10) / 10;
    }
    if (changes.unemploymentPct !== undefined) {
      updated.unemploymentPct = Math.round(clamp(updated.unemploymentPct + changes.unemploymentPct, 2, 30) * 10) / 10;
    }
    if (changes.taxRatePct !== undefined) {
      updated.taxRatePct = Math.round(clamp(updated.taxRatePct + changes.taxRatePct, 10, 60) * 10) / 10;
    }
    if (changes.energyReservesPct !== undefined) {
      updated.energyReservesPct = Math.round(clamp(updated.energyReservesPct + changes.energyReservesPct, 0, 100));
    }
    if (changes.foodReservesPct !== undefined) {
      updated.foodReservesPct = Math.round(clamp(updated.foodReservesPct + changes.foodReservesPct, 0, 100));
    }
    if (changes.infrastructureIndex !== undefined) {
      updated.infrastructureIndex = Math.round(clamp(updated.infrastructureIndex + changes.infrastructureIndex, 0, 100));
    }
    if (changes.publicApprovalPct !== undefined) {
      updated.publicApprovalPct = Math.round(clamp(updated.publicApprovalPct + changes.publicApprovalPct, 0, 100));
    }
    if (changes.governmentStabilityPct !== undefined) {
      updated.governmentStabilityPct = Math.round(clamp(updated.governmentStabilityPct + changes.governmentStabilityPct, 0, 100));
    }
    if (changes.pressFreedomPct !== undefined) {
      updated.pressFreedomPct = Math.round(clamp(updated.pressFreedomPct + changes.pressFreedomPct, 0, 100));
    }
    if (changes.militaryReadinessPct !== undefined) {
      updated.militaryReadinessPct = Math.round(clamp(updated.militaryReadinessPct + changes.militaryReadinessPct, 0, 100));
    }

    return updated;
  }

  /**
   * Apply trust updates to ministers
   */
  static applyTrustUpdates(
    state: GameState,
    updates: { advisorId: string; metric: string; delta: number; reasonKu: string }[]
  ): GameState {
    if (!updates || updates.length === 0) return state;

    const updatedAdvisors = { ...state.advisors };
    const chronicleTrustChanges: { advisorId: AdvisorId; delta: number; reasonKu: string }[] = [];

    for (const update of updates) {
      const advId = update.advisorId as AdvisorId;
      const adv = updatedAdvisors[advId];
      if (!adv) continue;

      const currentScore = update.metric === 'respectForJudgment' ? adv.respectForJudgment : adv.trustInPresident;
      const newScore = clamp(currentScore + update.delta, 5, 98);

      const historyEntry = {
        turn: state.turn,
        target: 'president' as const,
        delta: update.delta,
        newScore,
        reasonKu: update.reasonKu,
        timestamp: Date.now()
      };

      updatedAdvisors[advId] = {
        ...adv,
        trustInPresident: update.metric === 'respectForJudgment' ? adv.trustInPresident : newScore,
        respectForJudgment: update.metric === 'respectForJudgment' ? newScore : adv.respectForJudgment,
        relationshipHistory: [historyEntry, ...(adv.relationshipHistory || [])]
      };

      chronicleTrustChanges.push({ advisorId: advId, delta: update.delta, reasonKu: update.reasonKu });
    }

    return {
      ...state,
      advisors: updatedAdvisors
    };
  }

  /**
   * Add new memories to ministers
   */
  static addMemories(
    state: GameState,
    newMemories: { advisorId: string; summaryKu: string; playerStanceKu?: string; promiseOrWarningKu?: string; unresolvedQuestionKu?: string }[]
  ): GameState {
    if (!newMemories || newMemories.length === 0) return state;

    const updatedAdvisors = { ...state.advisors };
    for (const mem of newMemories) {
      const advId = mem.advisorId as AdvisorId;
      const adv = updatedAdvisors[advId];
      if (!adv) continue;

      const entry = {
        turn: state.turn,
        summaryKu: mem.summaryKu,
        playerStanceKu: mem.playerStanceKu,
        promiseOrWarningKu: mem.promiseOrWarningKu,
        unresolvedQuestionKu: mem.unresolvedQuestionKu
      };

      updatedAdvisors[advId] = {
        ...adv,
        memories: [entry, ...(adv.memories || [])].slice(0, 10)
      };
    }

    return {
      ...state,
      advisors: updatedAdvisors
    };
  }

  /**
   * Confirm an Actionable Proposal generated from council debate
   */
  static confirmProposal(state: GameState, proposalId: string): GameState {
    const proposal = state.pendingProposals.find((p) => p.id === proposalId);
    if (!proposal || proposal.status !== 'pending_confirmation') return state;

    // Validate resource availability
    if (proposal.costBillion && state.stats.treasuryBillion < proposal.costBillion) {
      return state;
    }

    // Apply stats through deterministic engine
    let newStats = state.stats;
    if (proposal.costBillion) {
      newStats = this.applyStatChanges(newStats, { treasuryBillion: -proposal.costBillion });
    }
    newStats = this.applyStatChanges(newStats, proposal.statChanges);

    // Apply country relation changes
    const updatedCountries = { ...state.countries };
    if (proposal.relationChanges) {
      for (const [cId, delta] of Object.entries(proposal.relationChanges)) {
        if (updatedCountries[cId]) {
          updatedCountries[cId] = {
            ...updatedCountries[cId],
            relationsWithArven: clamp(updatedCountries[cId].relationsWithArven + delta, -100, 100)
          };
        }
      }
    }

    // Proposer trust increases
    const updatedAdvisors = { ...state.advisors };
    if (proposal.proposedBy && proposal.proposedBy !== 'player' && updatedAdvisors[proposal.proposedBy]) {
      const advId = proposal.proposedBy as AdvisorId;
      const adv = updatedAdvisors[advId];
      const newScore = clamp(adv.trustInPresident + 8, 5, 98);
      updatedAdvisors[advId] = {
        ...adv,
        trustInPresident: newScore,
        relationshipHistory: [
          {
            turn: state.turn,
            target: 'president',
            delta: 8,
            newScore,
            reasonKu: `سەرۆک کۆمار پێشنیاری «${proposal.titleKu}»ی پەسەند کرد.`,
            timestamp: Date.now()
          },
          ...adv.relationshipHistory
        ]
      };
    }

    // Chronicle record
    const chronicleEntry: ChronicleRecord = {
      id: `prop-confirm-${Date.now()}`,
      turn: state.turn,
      timestamp: Date.now(),
      titleKu: `پەسەندکردنی پێشنیاری دەوڵەت: ${proposal.titleKu}`,
      contentKu: `بە فەرمانی سەرۆک کۆمار، پێشنیاری پێشکەشکراو لە کۆبوونەوەی ئەنجومەن جێبەجێکرا. ${proposal.summaryKu}`,
      category: 'decision',
      topicKu: 'بڕیاری کابینە',
      isSecret: false,
      impactSummaryKu: proposal.reasoningKu
    };

    return {
      ...state,
      stats: newStats,
      countries: updatedCountries,
      advisors: updatedAdvisors,
      pendingProposals: state.pendingProposals.filter((p) => p.id !== proposalId),
      chronicle: [chronicleEntry, ...state.chronicle]
    };
  }

  /**
   * Reject an Actionable Proposal
   */
  static rejectProposal(state: GameState, proposalId: string): GameState {
    const proposal = state.pendingProposals.find((p) => p.id === proposalId);
    if (!proposal) return state;

    const updatedAdvisors = { ...state.advisors };
    if (proposal.proposedBy && proposal.proposedBy !== 'player' && updatedAdvisors[proposal.proposedBy]) {
      const advId = proposal.proposedBy as AdvisorId;
      const adv = updatedAdvisors[advId];
      const newScore = clamp(adv.respectForJudgment - 4, 5, 98);
      updatedAdvisors[advId] = {
        ...adv,
        respectForJudgment: newScore,
        relationshipHistory: [
          {
            turn: state.turn,
            target: 'president',
            delta: -4,
            newScore,
            reasonKu: `سەرۆک کۆمار پێشنیاری «${proposal.titleKu}»ی رەتکردەوە.`,
            timestamp: Date.now()
          },
          ...adv.relationshipHistory
        ]
      };
    }

    const chronicleEntry: ChronicleRecord = {
      id: `prop-reject-${Date.now()}`,
      turn: state.turn,
      timestamp: Date.now(),
      titleKu: `رەتکردنەوەی پێشنیاری: ${proposal.titleKu}`,
      contentKu: `سەرۆک کۆمار بڕیاریدا پێشنیاری پەیوەست بە «${proposal.titleKu}» جێبەجێ نەکرێت.`,
      category: 'decision',
      topicKu: 'رەتکردنەوەی پێشنیار',
      isSecret: false,
      impactSummaryKu: 'پێشنیارەکە لە کارنامەی دەوڵەت لادرا.'
    };

    return {
      ...state,
      advisors: updatedAdvisors,
      pendingProposals: state.pendingProposals.filter((p) => p.id !== proposalId),
      chronicle: [chronicleEntry, ...state.chronicle]
    };
  }

  /**
   * Apply a presidential decision card
   */
  static applyDecision(state: GameState, decisionId: string, optionId: string): GameState {
    const decision = state.pendingDecisions.find((d) => d.id === decisionId);
    if (!decision) return state;

    const option = decision.options.find((o) => o.id === optionId);
    if (!option) return state;

    // 1. Apply immediate stats
    const newStats = this.applyStatChanges(state.stats, option.immediateEffects);

    // 2. Adjust country relationships
    const updatedCountries = { ...state.countries };
    if (option.relationEffects) {
      for (const [cId, delta] of Object.entries(option.relationEffects)) {
        if (updatedCountries[cId]) {
          const current = updatedCountries[cId].relationsWithArven;
          updatedCountries[cId] = {
            ...updatedCountries[cId],
            relationsWithArven: clamp(current + delta, -100, 100)
          };
        }
      }
    }

    // 3. Adjust advisor loyalty, trust, and evaluate red lines
    const updatedAdvisors = { ...state.advisors };
    if (option.advisorReactions) {
      for (const [advId, reaction] of Object.entries(option.advisorReactions)) {
        const advKey = advId as AdvisorId;
        if (updatedAdvisors[advKey]) {
          const adv = updatedAdvisors[advKey];
          let deltaTrust = 0;
          let deltaRespect = 0;
          let reasonKu = '';

          if (reaction === 'support') {
            deltaTrust = 6;
            deltaRespect = 5;
            reasonKu = `سەرۆک بڕیارێکی هەڵبژارد کە لەگەڵ بەرژەوەندییەکانی ${adv.roleKu} دەگونجێت.`;
          } else if (reaction === 'oppose') {
            deltaTrust = -8;
            deltaRespect = -6;
            reasonKu = `سەرۆک هۆشدارییەکانی ${adv.nameKu}ی لەبەرچاو نەگرت لە دۆسیەی «${decision.titleKu}».`;
          }

          // Check if red line was crossed
          const crossedRedLine = (adv.privateAgenda?.redLinesKu || []).some((rl) =>
            option.textKu.toLowerCase().includes(rl.toLowerCase().slice(0, 8))
          );
          if (crossedRedLine) {
            deltaTrust -= 10;
            reasonKu += ' (بەزاندنی هێڵی سووری بەردەم وەزیر!)';
          }

          const newTrust = clamp(adv.trustInPresident + deltaTrust, 5, 98);
          const newRespect = clamp(adv.respectForJudgment + deltaRespect, 5, 98);

          updatedAdvisors[advKey] = {
            ...adv,
            loyalty: clamp(adv.loyalty + (reaction === 'support' ? 5 : -7), 5, 100),
            trustInPresident: newTrust,
            respectForJudgment: newRespect,
            relationshipHistory: [
              {
                turn: state.turn,
                target: 'president',
                delta: deltaTrust,
                newScore: newTrust,
                reasonKu,
                timestamp: Date.now()
              },
              ...adv.relationshipHistory
            ]
          };
        }
      }
    }

    // 4. Queue delayed consequences if present
    const updatedDelayed = [...state.delayedConsequences];
    if (option.delayedConsequence) {
      const consequence: DelayedConsequence = {
        id: `consequence-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        originDecisionTitleKu: decision.titleKu,
        originTurn: state.turn,
        triggerTurn: option.delayedConsequence.triggerTurn,
        headlineKu: option.delayedConsequence.headlineKu,
        descriptionKu: option.delayedConsequence.descriptionKu,
        statEffects: option.delayedConsequence.statEffects,
        relationEffects: option.delayedConsequence.relationEffects,
        executed: false
      };
      updatedDelayed.push(consequence);
    }

    // 5. Create chronicle log
    const impactList: string[] = [];
    if (option.immediateEffects.treasuryBillion) {
      impactList.push(`خەزێنە: ${option.immediateEffects.treasuryBillion > 0 ? '+' : ''}${option.immediateEffects.treasuryBillion}$B`);
    }
    if (option.immediateEffects.publicApprovalPct) {
      impactList.push(`ڕای گشتی: ${option.immediateEffects.publicApprovalPct > 0 ? '+' : ''}${option.immediateEffects.publicApprovalPct}%`);
    }
    if (option.immediateEffects.energyReservesPct) {
      impactList.push(`یەدەگی وزە: ${option.immediateEffects.energyReservesPct > 0 ? '+' : ''}${option.immediateEffects.energyReservesPct}%`);
    }

    const chronicleEntry: ChronicleRecord = {
      id: `chron-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      turn: state.turn,
      timestamp: Date.now(),
      titleKu: `بڕیاردرا: ${decision.titleKu}`,
      contentKu: `سەرۆک کۆمار ئەم بژاردەیەی هەڵبژارد: «${option.textKu}»`,
      category: 'decision',
      topicKu: decision.category,
      isSecret: false,
      impactSummaryKu: impactList.length > 0 ? impactList.join(' · ') : 'کاریگەری سیاسی لەسەر کابینە'
    };

    // Remove this decision from pending
    const remainingDecisions = state.pendingDecisions.filter((d) => d.id !== decisionId);

    return {
      ...state,
      stats: newStats,
      countries: updatedCountries,
      advisors: updatedAdvisors,
      delayedConsequences: updatedDelayed,
      pendingDecisions: remainingDecisions,
      chronicle: [chronicleEntry, ...state.chronicle]
    };
  }

  /**
   * Vote on a parliamentary bill
   */
  static voteOnBill(state: GameState, billId: string): GameState {
    const bill = state.bills.find((b) => b.id === billId);
    if (!bill || bill.status !== 'pending') return state;

    let forVotes = 0;
    let againstVotes = 0;
    let abstainVotes = 0;

    // Simulate voting across parties
    state.parties.forEach((party) => {
      let partyForRatio = 0.5;

      if (party.alignment === 'coalition') {
        partyForRatio = 0.85 * (party.loyaltyToPresident / 100);
      } else if (party.alignment === 'opposition') {
        if (bill.category === 'welfare') partyForRatio = 0.7;
        else if (bill.category === 'security') partyForRatio = 0.45;
        else partyForRatio = 0.2;
      } else {
        partyForRatio = 0.5;
      }

      const partyFor = Math.round(party.seats * partyForRatio);
      const partyAgainst = Math.round(party.seats * (1 - partyForRatio) * 0.85);
      const partyAbstain = party.seats - partyFor - partyAgainst;

      forVotes += partyFor;
      againstVotes += partyAgainst;
      abstainVotes += Math.max(0, partyAbstain);
    });

    const isPassed = forVotes >= 101; // Majority of 200
    const updatedBill: BillProposal = {
      ...bill,
      status: isPassed ? 'passed' : 'rejected',
      supportBreakdown: { for: forVotes, against: againstVotes, abstain: abstainVotes }
    };

    let newStats = state.stats;
    if (isPassed) {
      newStats = this.applyStatChanges(newStats, bill.effectsOnPass);
    }

    const chronicleEntry: ChronicleRecord = {
      id: `bill-chron-${Date.now()}`,
      turn: state.turn,
      timestamp: Date.now(),
      titleKu: `پەرلەمان: ${bill.titleKu} ${isPassed ? 'پەسەندکرا' : 'رەتکرایەوە'}`,
      contentKu: isPassed
        ? `یاساکە بە ${forVotes} دەنگی بەڵێ بەرامبەر ${againstVotes} دەنگی نەخێر پەسەندکرا. ${bill.consequencesKu.passed}`
        : `یاساکە بە ${againstVotes} دەنگی نەخێر بەرامبەر ${forVotes} دەنگی بەڵێ رەتکرایەوە. ${bill.consequencesKu.failed}`,
      category: 'parliament',
      topicKu: 'یاسادانان',
      isSecret: false,
      impactSummaryKu: isPassed ? 'یاسای فەرمی دەوڵەت جێبەجێ دەکرێت' : 'شکستی دەنگی هاوپەیمانی'
    };

    return {
      ...state,
      stats: newStats,
      bills: state.bills.map((b) => (b.id === billId ? updatedBill : b)),
      chronicle: [chronicleEntry, ...state.chronicle]
    };
  }

  /**
   * Advance turn by 1: process delayed consequences, economic cycle, side agreements, and spawn next events
   */
  static advanceTurn(state: GameState): GameState {
    const nextTurn = state.turn + 1;
    let newStats = { ...state.stats };
    const newChronicle = [...state.chronicle];
    const newCountries = { ...state.countries };
    const updatedSideAgreements = [...(state.sideAgreements || [])];

    // 1. Macroeconomic quarterly cycle
    const quarterlyRevenue = 2.5 + (newStats.taxRatePct / 100) * 8 + newStats.gdpGrowthPct * 0.5;
    const quarterlyExpense = 3.2 + newStats.debtBillion * 0.012 + newStats.militaryReadinessPct * 0.02;
    const netTreasury = Math.round((quarterlyRevenue - quarterlyExpense) * 10) / 10;

    newStats = this.applyStatChanges(newStats, {
      treasuryBillion: netTreasury,
      energyReservesPct: -5,
      foodReservesPct: -3
    });

    // Check low energy penalty
    if (newStats.energyReservesPct < 25) {
      newStats = this.applyStatChanges(newStats, {
        inflationPct: 1.2,
        publicApprovalPct: -4,
        governmentStabilityPct: -3
      });
      newChronicle.unshift({
        id: `alert-energy-${nextTurn}`,
        turn: nextTurn,
        timestamp: Date.now(),
        titleKu: 'هۆشداری کەمبوونەوەی وزە!',
        contentKu: 'یەدەگی وزەی نیشتمانی دابەزیوە بۆ خوار ٢٥٪؛ پچڕانی کارەبا لە هەندێک گەڕەکی لۆریان و وەیرا دەستیپێکردووە.',
        category: 'crisis',
        topicKu: 'قەیرانی وزە',
        isSecret: false,
        impactSummaryKu: 'زیان بە ڕای گشتی و هەڵئاوسان'
      });
    }

    // 2. Process delayed consequences for this turn
    const updatedDelayed = state.delayedConsequences.map((c) => {
      if (c.triggerTurn === nextTurn && !c.executed) {
        newStats = this.applyStatChanges(newStats, c.statEffects);

        if (c.relationEffects) {
          for (const [cId, delta] of Object.entries(c.relationEffects)) {
            if (newCountries[cId]) {
              newCountries[cId] = {
                ...newCountries[cId],
                relationsWithArven: clamp(newCountries[cId].relationsWithArven + delta, -100, 100)
              };
            }
          }
        }

        newChronicle.unshift({
          id: `delayed-chron-${c.id}`,
          turn: nextTurn,
          timestamp: Date.now(),
          titleKu: `دەرئەنجامی بڕیاری پێشوو: ${c.headlineKu}`,
          contentKu: `${c.descriptionKu} (سەرچاوەی بڕیار لە وەرزی ${c.originTurn}: ${c.originDecisionTitleKu})`,
          category: 'delayed_consequence',
          topicKu: 'دەرئەنجامی دواکەوتوو',
          isSecret: false,
          impactSummaryKu: 'دەرئەنجامی درێژخایەنی بڕیارەکانی سەرۆک'
        });

        return { ...c, executed: true };
      }
      return c;
    });

    // 3. Background simulation of Private Minister-to-Minister Side Agreements (Section 8B)
    if (nextTurn === 2 && !updatedSideAgreements.some((sa) => sa.id === 'side-agreement-2')) {
      updatedSideAgreements.push({
        id: 'side-agreement-2',
        titleKu: 'پەیمانی نهێنی چاودێری سنووری باکوور و بەشی هەواڵگری',
        participants: ['darok', 'sami'],
        purposeKu: 'هەماهەنگی نهێنی لە نێوان سوپا و دەزگای DNI بۆ ناردنی تیمی چاودێری بۆ گەرووی دراڤیک بەبێ ئاگاداری پەرلەمان.',
        conditionsKu: 'سامی کورد دەستکراوە دەبێت لە تۆڕی سایبەری، ژەنەڕاڵ دارۆکیش دەستگەیشتنی خێرای دەبێت بە دۆسیە نهێنییەکان.',
        status: 'active',
        turnCreated: 2,
        discovered: false,
        discoveryReliability: 'verified',
        consequenceKu: '+5% ئامادەیی سوپا لە ژێر پەردەی بێدەنگی'
      });
    }

    if (nextTurn === 3 && !updatedSideAgreements.some((sa) => sa.id === 'side-agreement-3')) {
      updatedSideAgreements.push({
        id: 'side-agreement-3',
        titleKu: 'سازانی ژێربەژێری پەرلەمانی لەسەر سۆبسیدی گەنم',
        participants: ['nara', 'mira'],
        purposeKu: 'رێککەوتنی نێوان وەزیری دارایی و ڕابەری ئۆپۆزسیۆن بۆ تێپەڕاندنی سۆبسیدی نان بەبێ دروستکردنی شڵەژانی پەرلەمانی.',
        conditionsKu: 'میرا سۆلێن دەنگدان بە بودجەی چاکسازی ناکاتە بیانووی خۆپیشاندان ئەگەر نارا سێ ملیار دۆلار بۆ نان مسۆگەر بکات.',
        status: 'active',
        turnCreated: 3,
        discovered: false,
        discoveryReliability: 'high',
        consequenceKu: 'هێورکردنەوەی شەقام لە بەرامبەر پاراستنی ڕێژەی باج'
      });
    }

    // 4. Spawn turn-specific decision cards if not yet present
    const newDecisions = [...state.pendingDecisions];
    const generatedForTurn = this.generateDecisionsForTurn(nextTurn);
    for (const d of generatedForTurn) {
      if (!newDecisions.some((existing) => existing.id === d.id)) {
        newDecisions.push(d);
      }
    }

    // 5. Check End of Game / Election
    let isGameOver = false;
    let endReason: string | undefined = undefined;

    if (nextTurn > state.maxTurns) {
      isGameOver = true;
      const finalScore =
        newStats.publicApprovalPct * 0.5 +
        newStats.governmentStabilityPct * 0.3 +
        (newStats.gdpGrowthPct > 2 ? 10 : 0) -
        (newStats.inflationPct > 8 ? 10 : 0);

      if (finalScore >= 45) {
        endReason = `سەرکەوتن لە هەڵبژاردندا! هاوپەیمانی دیموکراتی ئارڤێن بە بەدەستهێنانی متمانەی زۆرینەی خەڵک (ڕای گشتی ${newStats.publicApprovalPct}٪) بۆ خولی دووەم هەڵبژێردرایەوە. کۆمار گەیشتە سەقامگیری و داهاتوویەکی گەش.`;
      } else {
        endReason = `شکست لە هەڵبژاردن! بەهۆی دابەزینی ڕای گشتی (${newStats.publicApprovalPct}٪) و بارگرانی ئابووری، پارتەکەتان زۆرینەی پەرلەمانی لەدەستدا. هاوپەیمانی چاکسازی بە سەرۆکایەتی میرا سۆلێن حکومەتی نوێ پێکدەهێنێت.`;
      }

      newChronicle.unshift({
        id: `election-result-${Date.now()}`,
        turn: state.maxTurns,
        timestamp: Date.now(),
        titleKu: 'ئەنجامی هەڵبژاردنی گشتی کۆماری ئارڤێن',
        contentKu: endReason,
        category: 'election',
        topicKu: 'هەڵبژاردن',
        isSecret: false,
        impactSummaryKu: 'کۆتایی خولی سەرۆکایەتی'
      });
    }

    // Check emergency loss conditions
    if (newStats.governmentStabilityPct <= 5) {
      isGameOver = true;
      endReason = 'هاوپەیمانی حکومەت بە تەواوی هەڵوەشایەوە و دەنگی بێمتمانەیی بە زۆرینەی رەها درا. کابینەکە رووخا!';
    } else if (newStats.publicApprovalPct <= 8) {
      isGameOver = true;
      endReason = 'خۆپیشاندانی سەرتاسەری و نافەرمانی مەدەنی بەردەوام سەرۆکایەتی ناچار بە دەستلەکارکێشانەوە کرد.';
    }

    return {
      ...state,
      turn: nextTurn,
      currentSessionId: `session-turn-${nextTurn}`,
      isGameOver,
      gameEndReasonKu: endReason,
      stats: newStats,
      countries: newCountries,
      delayedConsequences: updatedDelayed,
      sideAgreements: updatedSideAgreements,
      pendingDecisions: newDecisions,
      chronicle: newChronicle,
      activeCrisesCount: newDecisions.filter((d) => d.category === 'crisis').length
    };
  }

  /**
   * Reveal a secret side agreement through intelligence investigation
   */
  static revealSideAgreement(state: GameState, agreementId: string, discoverySourceKu: string): GameState {
    const agreement = state.sideAgreements.find((sa) => sa.id === agreementId);
    if (!agreement || agreement.discovered) return state;

    const updatedAgreements = state.sideAgreements.map((sa) =>
      sa.id === agreementId
        ? {
            ...sa,
            discovered: true,
            discoverySourceKu,
            discoveryTurn: state.turn,
            status: 'discovered' as const
          }
        : sa
    );

    const chronicleRecord: ChronicleRecord = {
      id: `leak-revealed-${Date.now()}`,
      turn: state.turn,
      timestamp: Date.now(),
      titleKu: `دۆزینەوەی بەڵگەنامەی نهێنی: ${agreement.titleKu}`,
      contentKu: `دەزگای زانیاری دەوڵەت پەردەی لەسەر رێککەوتنێکی ژێربەژێری نێوان وەزیرەکان (${agreement.participants.join(' و ')}) هەڵدایەوە. بەڵگەکان پشتڕاستکراونەتەوە.`,
      category: 'intelligence_leak',
      topicKu: 'ئاشکراکردنی نهێنی',
      isSecret: false,
      discoverySourceKu,
      discoveredTurn: state.turn,
      discoveryReliability: agreement.discoveryReliability,
      impactSummaryKu: agreement.consequenceKu
    };

    return {
      ...state,
      sideAgreements: updatedAgreements,
      chronicle: [chronicleRecord, ...state.chronicle]
    };
  }

  /**
   * Decision generator for turns 2 to 12
   */
  private static generateDecisionsForTurn(turn: number): DecisionCard[] {
    const cards: DecisionCard[] = [];

    if (turn === 2) {
      cards.push({
        id: 'dec-turn2-cyber-tazira',
        turnAvailable: 2,
        titleKu: 'دزەکردنی زانیاری سایبەری: ئاشکرابوونی گرێبەستەکانی کۆشکی سەرۆکایەتی',
        titleEn: 'Tazira Cyber Espionage Leak',
        sourceKu: 'بەڕێوەبەرایەتی هەواڵگری نیشتمانی (سامی کورد)',
        briefKu: 'هێرشێکی ئاڵۆزی سایبەری لە دەرەوەی وڵات ئەنجامدراوە. سامی کورد ئاماژە بە دەستی شاراوەی کۆماری تازیرا دەکات. بەڵگەنامەی نهێنی بودجەی سەربازی ئارڤێن لە تۆڕە کۆمەڵایەتییەکان بڵاوکراوەتەوە.',
        category: 'security',
        isMandatory: true,
        options: [
          {
            id: 'opt-cyber-retaliate',
            textKu: 'رێگەپێدان بە سامی کورد بۆ هێرشی پێچەوانەی ئەلیکترۆنی و داخستنی راگەیاندنی بێمۆڵەت.',
            immediateEffects: {
              pressFreedomPct: -8,
              militaryReadinessPct: 5,
              publicApprovalPct: -3
            },
            relationEffects: { tazira: -25 },
            advisorReactions: { sami: 'support', mira: 'oppose', rayan: 'neutral' },
            rationaleKu: 'سامی کورد کۆنترۆڵی زانیارییەکان دەکات، بەڵام میرا سۆلێن دەڵێت سانسۆر لەسەر رۆژنامەنووسان دەسەپێنن.',
            delayedConsequence: {
              triggerTurn: 4,
              headlineKu: 'ئاشکرابوونی بەڵگەی سیخوڕی ناوخۆیی لەلایەن رێکخراوەکانی مافی مرۆڤ!',
              descriptionKu: 'تەکنیکی هەواڵگری دەوڵەت کاردانەوەی توندی لێکەوتەوە و لە نێودەوڵەتیدا رەخنەی لێگیرا.',
              statEffects: { pressFreedomPct: -5, publicApprovalPct: -4 }
            }
          },
          {
            id: 'opt-cyber-transparency',
            textKu: 'بەڕێوەبردنی کۆنگرەیەکی رۆژنامەوانی روون و بڵاوکردنەوەی هەموو راستییەکان بە شەفافی.',
            immediateEffects: {
              pressFreedomPct: 10,
              publicApprovalPct: 5,
              governmentStabilityPct: -3
            },
            relationEffects: { tazira: -5 },
            advisorReactions: { mira: 'support', rayan: 'support', sami: 'oppose' },
            rationaleKu: 'راستگۆیی لەگەڵ هاوڵاتیان متمانە دروست دەکات، بەڵام لاوازی هەواڵگری دەردەخات.',
            delayedConsequence: {
              triggerTurn: 4,
              headlineKu: 'شەفافیەتی دەوڵەت متمانەی وەبەرهێنەرانی نێودەوڵەتی بەدەستهێنا!',
              descriptionKu: 'کۆماری نێمەر و یەکێتیی کالدۆر ستایشی دیموکراسی ئارڤێنیان کرد و پشکی سەرمایە لە بانکەکان بەرزبووەوە.',
              statEffects: { gdpGrowthPct: 0.8, treasuryBillion: 2 }
            }
          }
        ]
      });

      cards.push({
        id: 'dec-turn2-bread-subsidy',
        turnAvailable: 2,
        titleKu: 'قەیرانی گەنمی نیشتمانی و نرخی نان',
        titleEn: 'National Bread & Grain Subsidy Crisis',
        sourceKu: 'وەزارەتی دارایی و ژووری بازرگانی',
        briefKu: 'وشکەساڵی لە هەندێک ناوچە و بەرزبوونەوەی نرخی هاوردە بووەتە هۆی گرانبوونی نان. نارا ڤێل هۆشداری دەدات لە سۆبسیدی گەورە، لە کاتێکدا سەندیکاکان هەڕەشەی مانگرتن دەکەن.',
        category: 'economy',
        isMandatory: false,
        options: [
          {
            id: 'opt-bread-subsidize',
            textKu: 'تەرخانکردنی ٣ ملیار دۆلار لە خەزێنە بۆ جێگیرکردنی نرخی نان و دانەوێڵە.',
            immediateEffects: { treasuryBillion: -3, foodReservesPct: 15, publicApprovalPct: 8, inflationPct: -0.6 },
            advisorReactions: { nara: 'oppose', rayan: 'support', mira: 'support' },
            rationaleKu: 'هاوڵاتیان هێور دەبنەوە بەڵام خەزێنە زیانی بەردەکەوێت.'
          },
          {
            id: 'opt-bread-import-nemer',
            textKu: 'ڕێککەوتنی بەپەلە لەگەڵ کۆماری نێمەر بۆ هاوردەی هەرزانی گەنم.',
            immediateEffects: { foodReservesPct: 12, treasuryBillion: -1.2, publicApprovalPct: 4 },
            relationEffects: { nemer: 25 },
            advisorReactions: { lina: 'support', nara: 'support' },
            rationaleKu: 'کۆماری نێمەر دانەوێڵەی زۆری هەیە و ئەمە پەیوەندی دۆستانە قووڵتر دەکات.'
          }
        ]
      });
    }

    if (turn === 3) {
      cards.push({
        id: 'dec-turn3-naval-pact',
        turnAvailable: 3,
        titleKu: 'کۆنفرانسی ئاسایشی دەریایی لەگەڵ ڤێلۆریا و کالدۆر',
        titleEn: 'Maritime Security Summit with Veloria & Kaldor',
        sourceKu: 'وەزارەتی دەرەوە (لینا ئاراز)',
        briefKu: 'چەتەگەری دەریایی و گرژییەکانی باشوور هەڕەشە لە کەشتییە بازرگانییەکانی بەندەری لۆریان دەکەن. فیدراسیۆنی ڤێلۆریا داوای پێکهێنانی کەشتیگەلی هاوبەشی دەریایی دەکات لە ژێر فەرماندەیی هاوبەشدا.',
        category: 'diplomacy',
        isMandatory: true,
        options: [
          {
            id: 'opt-naval-join',
            textKu: 'بەشداری لە کەشتیگەلی هاوبەش بە بەشداری ٢ کەشتی سەربازی ئارڤێن.',
            immediateEffects: { militaryReadinessPct: 8, treasuryBillion: -1.5, publicApprovalPct: 2 },
            relationEffects: { veloria: 25, kaldor: 15, sahran: -10 },
            advisorReactions: { lina: 'support', darok: 'support', nara: 'neutral' },
            rationaleKu: 'پاراستنی رێڕەوەکانی کەنداوی لۆریان و چەسپاندنی پێگەی دەریایی ئارڤێن.',
            delayedConsequence: {
              triggerTurn: 5,
              headlineKu: 'بەرپەرچدانەوەی دەریایی: بازرگانی لۆریان بە رێژەی ٢٠٪ زیادی کرد!',
              descriptionKu: 'کەشتییە سەربازییە هاوبەشەکان رێگای دەریاییان پاراست و هاتوچۆی کەشتییە بازرگانییەکان بەبێ ترس زیادی کرد.',
              statEffects: { gdpGrowthPct: 0.9, treasuryBillion: 2.5 }
            }
          },
          {
            id: 'opt-naval-independent',
            textKu: 'پاراستنی سەروەری تەواو و بەهێزکردنی بنکەی دەریایی نیشتمانی لۆریان بە تەنیا.',
            immediateEffects: { militaryReadinessPct: 5, treasuryBillion: -2.8, publicApprovalPct: 4 },
            relationEffects: { veloria: -10 },
            advisorReactions: { darok: 'support', nara: 'oppose', lina: 'oppose' },
            rationaleKu: 'سەربەخۆیی فەرماندەیی، گەرچی لە رووی داراییەوە قورسترە.'
          }
        ]
      });
    }

    if (turn === 4) {
      cards.push({
        id: 'dec-turn4-labour-strike',
        turnAvailable: 4,
        titleKu: 'مانگرتنی کرێکارانی بەندەری لۆریان و کارگەکانی مێرۆس',
        titleEn: 'Port & Industrial Labor Strike Crisis',
        sourceKu: 'وەزارەتی ناوخۆ و پۆلیسی شارەوانی',
        briefKu: 'زیاتر لە ٤٠ هەزار کرێکار لە بەندەری لۆریان دەستیان لە کار کێشاوەتەوە بەهۆی کەمبوونەوەی توانای کڕین و بەرزبوونەوەی هەڵئاوسان. کەشتییەکان لە دەریادا راوەستاون.',
        category: 'crisis',
        isMandatory: true,
        options: [
          {
            id: 'opt-strike-concede',
            textKu: 'پەسەندکردنی داواکاری کرێکاران: ١٠٪ بەرزکردنەوەی مووچە و بیمەی پزیشکی.',
            immediateEffects: { treasuryBillion: -3.5, inflationPct: 1.1, publicApprovalPct: 9, governmentStabilityPct: 5 },
            advisorReactions: { mira: 'support', rayan: 'support', nara: 'oppose' },
            rationaleKu: 'مانگرتن دەشکێت و خەڵک پشتگیریتان دەکەن، بەڵام هەڵئاوسان هەندێک دەجوڵێت.'
          },
          {
            id: 'opt-strike-police',
            textKu: 'بە فەرمانی سەرۆک بەندەرەکە بە هێزی ئەمنی بکەنەوە بۆ رێگریکردن لە ئیفلیجی ئابووری.',
            immediateEffects: { publicApprovalPct: -10, governmentStabilityPct: -6, pressFreedomPct: -8, gdpGrowthPct: 0.4 },
            advisorReactions: { darok: 'support', sami: 'support', mira: 'oppose', rayan: 'oppose' },
            rationaleKu: 'ئابووری بەردەوام دەبێت بەڵام کینەی کۆمەڵایەتی قووڵ دروست دەکات.'
          }
        ]
      });
    }

    if (turn === 5) {
      cards.push({
        id: 'dec-turn5-summit',
        turnAvailable: 5,
        titleKu: 'لووتکەی مەزنی سەروەری: میوانداریکردنی ٧ وڵات لە وەیرا',
        titleEn: 'Grand Sovereign Summit in Veyra',
        sourceKu: 'دیوانی سەرۆکایەتی و وەزارەتی دەرەوە',
        briefKu: 'سەرۆک کۆمار سەرکردەی حەوت دەوڵەتەکەی جیهان بانگهێشت دەکات بۆ کۆشکی کۆماری وەیرا بۆ واژۆکردنی پەیماننامەی ئاشتی و نەهێشتنی هەڕەشەی چەکی قورس.',
        category: 'diplomacy',
        isMandatory: true,
        options: [
          {
            id: 'opt-summit-grand',
            textKu: 'میوانداریکردنی شاهانە و راگەیاندنی پێشنیاری پەیمانی ناوچەیی بێچەک.',
            immediateEffects: { treasuryBillion: -2, publicApprovalPct: 8, governmentStabilityPct: 7 },
            relationEffects: { kaldor: 15, nemer: 20, veloria: 10, dravik: 5 },
            advisorReactions: { lina: 'support', rayan: 'support', mira: 'support' },
            rationaleKu: 'ئارڤێن دەبێتە سەنتەری بڕیاری دیپلۆماسی جیهان.'
          },
          {
            id: 'opt-summit-pragmatic',
            textKu: 'تەرکیز تەنها لەسەر کێشەی هێڵی وزە و بازرگانی سەحران و دراڤیک بێت.',
            immediateEffects: { energyReservesPct: 15, treasuryBillion: 1.5, publicApprovalPct: 4 },
            relationEffects: { sahran: 15, dravik: 10 },
            advisorReactions: { nara: 'support', lina: 'support' },
            rationaleKu: 'دەستکەوتی ماددی خێرا بەبێ خەرجی زۆر.'
          }
        ]
      });
    }

    return cards;
  }
}
