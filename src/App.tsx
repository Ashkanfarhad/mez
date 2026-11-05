import React, { useState, useEffect } from 'react';
import { GameState, AdvisorId, ActionableProposal, ChronicleRecord } from './types/game';
import { INITIAL_GAME_STATE } from './data/initialScenario';
import { GameEngine } from './engine/gameEngine';
import { sound } from './engine/audioEngine';
import { HeaderHUD, ScreenId } from './components/HeaderHUD';
import { OverviewScreen } from './components/screens/OverviewScreen';
import { CouncilScreen } from './components/screens/CouncilScreen';
import { WorldMapScreen } from './components/screens/WorldMapScreen';
import { DiplomacyScreen } from './components/screens/DiplomacyScreen';
import { ParliamentScreen } from './components/screens/ParliamentScreen';
import { EconomyScreen } from './components/screens/EconomyScreen';
import { SecurityScreen } from './components/screens/SecurityScreen';
import { MediaScreen } from './components/screens/MediaScreen';
import { ChronicleScreen } from './components/screens/ChronicleScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

const AUTOSAVE_KEY = 'sovereign_table_autosave_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback to initial
        }
      }
    }
    return INITIAL_GAME_STATE;
  });

  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [diplomacyTargetCountryId, setDiplomacyTargetCountryId] = useState<string>('kaldor');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Autosave on state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(gameState));
    }
  }, [gameState]);

  // Advance turn
  const handleAdvanceTurn = () => {
    setGameState((prev) => GameEngine.advanceTurn(prev));
  };

  // Apply presidential decision
  const handleApplyDecision = (decisionId: string, optionId: string) => {
    setGameState((prev) => GameEngine.applyDecision(prev, decisionId, optionId));
  };

  // Vote on parliamentary bill
  const handleVoteOnBill = (billId: string) => {
    setGameState((prev) => GameEngine.voteOnBill(prev, billId));
  };

  // Sign diplomatic treaty
  const handleSignTreaty = (treaty: {
    countryId: string;
    typeKu: string;
    descriptionKu: string;
    relationDelta: number;
    statDelta?: any;
  }) => {
    setGameState((prev) => {
      let updatedStats = prev.stats;
      if (treaty.statDelta) {
        updatedStats = GameEngine.applyStatChanges(updatedStats, treaty.statDelta);
      }

      const updatedCountries = { ...prev.countries };
      if (updatedCountries[treaty.countryId]) {
        updatedCountries[treaty.countryId] = {
          ...updatedCountries[treaty.countryId],
          relationsWithArven: Math.min(100, Math.max(-100, updatedCountries[treaty.countryId].relationsWithArven + treaty.relationDelta))
        };
      }

      const newTreatyEntry = {
        countryId: treaty.countryId,
        typeKu: treaty.typeKu,
        turnSigned: prev.turn,
        descriptionKu: treaty.descriptionKu
      };

      const chronicleEntry: ChronicleRecord = {
        id: `treaty-chron-${Date.now()}`,
        turn: prev.turn,
        timestamp: Date.now(),
        titleKu: `واژۆکردنی دیپلۆماسی: ${treaty.typeKu}`,
        contentKu: treaty.descriptionKu,
        category: 'diplomacy',
        isSecret: false,
        impactSummaryKu: `پەیوەندی لەگەڵ ${updatedCountries[treaty.countryId]?.nameKu} بەهێزتر بوو.`
      };

      return {
        ...prev,
        stats: updatedStats,
        countries: updatedCountries,
        treatiesSigned: [newTreatyEntry, ...prev.treatiesSigned],
        chronicle: [chronicleEntry, ...prev.chronicle]
      };
    });
  };

  // Update national tax rate
  const handleUpdateTaxRate = (newRate: number) => {
    setGameState((prev) => {
      const delta = newRate - prev.stats.taxRatePct;
      const approvalDelta = delta > 0 ? -Math.round(delta * 0.8) : Math.round(Math.abs(delta) * 0.5);
      const updated = GameEngine.applyStatChanges(prev.stats, {
        taxRatePct: delta,
        publicApprovalPct: approvalDelta
      });

      const chronicleEntry: ChronicleRecord = {
        id: `tax-chron-${Date.now()}`,
        turn: prev.turn,
        timestamp: Date.now(),
        titleKu: `چاکسازی باج: گۆڕینی ڕێژەی باجی نیشتمانی بۆ ${newRate}٪`,
        contentKu: `سەرۆک کۆمار ڕێژەی باجی لە ${prev.stats.taxRatePct}٪ گۆڕی بۆ ${newRate}٪.`,
        category: 'decision',
        isSecret: false,
        impactSummaryKu: `داهاتی خەزێنە و کاریگەری لەسەر ڕای گشتی (${approvalDelta > 0 ? '+' : ''}${approvalDelta}٪)`
      };

      return {
        ...prev,
        stats: updated,
        chronicle: [chronicleEntry, ...prev.chronicle]
      };
    });
  };

  // Fund city project
  const handleInvestInCity = (cityId: string, projectName: string, costBillion: number) => {
    setGameState((prev) => {
      const city = prev.cities[cityId];
      if (!city) return prev;

      const updatedStats = GameEngine.applyStatChanges(prev.stats, {
        treasuryBillion: -costBillion,
        gdpGrowthPct: 0.4,
        infrastructureIndex: 5,
        publicApprovalPct: 3
      });

      const updatedCities = {
        ...prev.cities,
        [cityId]: {
          ...city,
          infrastructureLevel: Math.min(100, city.infrastructureLevel + 8),
          unemployment: Math.max(2, city.unemployment - 0.8),
          activeProjects: [...city.activeProjects, projectName]
        }
      };

      const chronicleEntry: ChronicleRecord = {
        id: `city-proj-${Date.now()}`,
        turn: prev.turn,
        timestamp: Date.now(),
        titleKu: `وەبەرهێنانی شارەوانی لە ${city.nameKu}`,
        contentKu: `پڕۆژەی «${projectName}» بە گوژمەی ${costBillion} ملیار دۆلار پەسەندکرا.`,
        category: 'decision',
        isSecret: false,
        impactSummaryKu: 'پەرەپێدانی ژێرخان و کەمکردنەوەی بێکاری'
      };

      return {
        ...prev,
        stats: updatedStats,
        cities: updatedCities,
        chronicle: [chronicleEntry, ...prev.chronicle]
      };
    });
  };

  // Launch security operation
  const handleLaunchOperation = (opNameKu: string, costBillion: number, statChanges: any) => {
    setGameState((prev) => {
      const updatedStats = GameEngine.applyStatChanges(prev.stats, statChanges);
      const chronicleEntry: ChronicleRecord = {
        id: `sec-op-${Date.now()}`,
        turn: prev.turn,
        timestamp: Date.now(),
        titleKu: `ئۆپەراسیۆنی نهێنی: ${opNameKu}`,
        contentKu: `بە فەرمانی سەرۆک کۆمار دەزگای هەواڵگری نیشتمانی (DNI) ئۆپەراسیۆنەکەی ئەنجامدا.`,
        category: 'crisis',
        isSecret: false,
        impactSummaryKu: 'پاراستنی ئاسایشی نیشتمانی'
      };

      return {
        ...prev,
        stats: updatedStats,
        chronicle: [chronicleEntry, ...prev.chronicle]
      };
    });
  };

  // Hold presidential press conference
  const handleHoldPressConference = (tone: 'patriotic' | 'economic' | 'compromise') => {
    setGameState((prev) => {
      let statDelta: any = {};
      let titleKu = '';

      if (tone === 'patriotic') {
        statDelta = { militaryReadinessPct: 5, publicApprovalPct: 3 };
        titleKu = 'وتاری نیشتمانی سەرۆک بۆ هاوڵاتیان لەسەر سەروەری کۆمار';
      } else if (tone === 'economic') {
        statDelta = { governmentStabilityPct: 4, inflationPct: -0.4 };
        titleKu = 'کۆنگرەی ڕۆژنامەوانی دارایی لەسەر شەفافیەت و چاکسازی بازاڕ';
      } else {
        statDelta = { governmentStabilityPct: 6, publicApprovalPct: 2 };
        titleKu = 'پەیامی سازانی سەرۆکایەتی کۆمار بۆ هێزە سیاسییەکان و ئۆپۆزسیۆن';
      }

      const updatedStats = GameEngine.applyStatChanges(prev.stats, statDelta);
      const chronicleEntry: ChronicleRecord = {
        id: `press-conf-${Date.now()}`,
        turn: prev.turn,
        timestamp: Date.now(),
        titleKu,
        contentKu: 'وتاری فەرمی سەرۆک لە هەموو کەناڵە تەلەفزیۆنی و رادیۆییەکانی وڵات پەخشکرا.',
        category: 'decision',
        isSecret: false,
        impactSummaryKu: 'کاردانەوەی خێرا لەسەر ڕای گشتی'
      };

      return {
        ...prev,
        stats: updatedStats,
        chronicle: [chronicleEntry, ...prev.chronicle]
      };
    });
  };

  // Add message to chat transcript
  const handleAddChatMessage = (message: {
    sender: 'player' | AdvisorId | 'council';
    textKu: string;
    speakerNameKu?: string;
  }) => {
    setGameState((prev) => ({
      ...prev,
      chatHistory: [
        ...prev.chatHistory,
        {
          id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          turn: prev.turn,
          sessionId: prev.currentSessionId,
          sender: message.sender,
          textKu: message.textKu,
          speakerNameKu: message.speakerNameKu,
          timestamp: Date.now()
        }
      ]
    }));
  };

  // Apply results from council turn (trust, memories, actionable proposals, rolling summary)
  const handleApplyCouncilTurnResult = (result: {
    trustUpdates?: { advisorId: string; metric: string; delta: number; reasonKu: string }[];
    newMemories?: { advisorId: string; summaryKu: string; playerStanceKu?: string; promiseOrWarningKu?: string; unresolvedQuestionKu?: string }[];
    actionableProposal?: ActionableProposal | null;
    meetingSummaryUpdateKu?: string;
  }) => {
    setGameState((prev) => {
      let updated = prev;
      if (result.trustUpdates && result.trustUpdates.length > 0) {
        updated = GameEngine.applyTrustUpdates(updated, result.trustUpdates);
      }
      if (result.newMemories && result.newMemories.length > 0) {
        updated = GameEngine.addMemories(updated, result.newMemories);
      }
      if (result.actionableProposal) {
        const exists = updated.pendingProposals.some((p) => p.id === result.actionableProposal!.id);
        if (!exists) {
          updated = {
            ...updated,
            pendingProposals: [result.actionableProposal, ...updated.pendingProposals]
          };
        }
      }
      if (result.meetingSummaryUpdateKu) {
        updated = {
          ...updated,
          rollingSummaryKu: result.meetingSummaryUpdateKu
        };
      }
      return updated;
    });
  };

  // Confirm actionable proposal
  const handleConfirmProposal = (proposalId: string) => {
    sound.playGavel();
    setGameState((prev) => GameEngine.confirmProposal(prev, proposalId));
  };

  // Reject actionable proposal
  const handleRejectProposal = (proposalId: string) => {
    sound.playClick();
    setGameState((prev) => GameEngine.rejectProposal(prev, proposalId));
  };

  // Reveal secret side agreement through intelligence
  const handleRevealSideAgreement = (agreementId: string, discoverySourceKu: string) => {
    sound.playTeletype();
    setGameState((prev) => GameEngine.revealSideAgreement(prev, agreementId, discoverySourceKu));
  };

  // Save / Load / Reset
  const handleSaveGame = (slot: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sovereign_table_slot_${slot}`, JSON.stringify(gameState));
    }
  };

  const handleLoadGame = (slot: number) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`sovereign_table_slot_${slot}`);
      if (saved) {
        try {
          setGameState(JSON.parse(saved));
        } catch {
          alert('هەڵە لە بارکردنی یاری!');
        }
      }
    }
  };

  const handleImportGame = (imported: GameState) => {
    setGameState(imported);
  };

  const handleResetGame = () => {
    setGameState(INITIAL_GAME_STATE);
    setActiveScreen('overview');
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleSelectCountryForDiplomacy = (countryId: string) => {
    setDiplomacyTargetCountryId(countryId);
    setActiveScreen('diplomacy');
  };

  return (
    <div className="min-h-screen bg-[#050a14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar HUD */}
      <HeaderHUD
        state={gameState}
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          sound.playClick();
          setActiveScreen(screen);
        }}
        onAdvanceTurn={handleAdvanceTurn}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {activeScreen === 'overview' && (
          <OverviewScreen
            state={gameState}
            onApplyDecision={handleApplyDecision}
            onNavigateToCouncil={() => setActiveScreen('council')}
          />
        )}

        {activeScreen === 'council' && (
          <CouncilScreen
            state={gameState}
            onAddChatMessage={handleAddChatMessage}
            onApplyCouncilTurnResult={handleApplyCouncilTurnResult}
            onConfirmProposal={handleConfirmProposal}
            onRejectProposal={handleRejectProposal}
          />
        )}

        {activeScreen === 'world_map' && (
          <WorldMapScreen
            state={gameState}
            onSelectCountryForDiplomacy={handleSelectCountryForDiplomacy}
          />
        )}

        {activeScreen === 'diplomacy' && (
          <DiplomacyScreen
            state={gameState}
            initialSelectedCountryId={diplomacyTargetCountryId}
            onSignTreaty={handleSignTreaty}
          />
        )}

        {activeScreen === 'parliament' && (
          <ParliamentScreen
            state={gameState}
            onVoteOnBill={handleVoteOnBill}
          />
        )}

        {activeScreen === 'economy' && (
          <EconomyScreen
            state={gameState}
            onUpdateTaxRate={handleUpdateTaxRate}
            onInvestInCity={handleInvestInCity}
          />
        )}

        {activeScreen === 'security' && (
          <SecurityScreen
            state={gameState}
            onLaunchOperation={handleLaunchOperation}
            onRevealSideAgreement={handleRevealSideAgreement}
          />
        )}

        {activeScreen === 'media' && (
          <MediaScreen
            state={gameState}
            onHoldPressConference={handleHoldPressConference}
          />
        )}

        {activeScreen === 'chronicle' && (
          <ChronicleScreen state={gameState} />
        )}

        {activeScreen === 'settings' && (
          <SettingsScreen
            state={gameState}
            onSaveGame={handleSaveGame}
            onLoadGame={handleLoadGame}
            onImportGame={handleImportGame}
            onResetGame={handleResetGame}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}
      </main>

      {/* Subtle Game Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <span>THE SOVEREIGN TABLE · مێزی باڵادەست · کۆماری ئارڤێن</span>
        <span className="mx-2">·</span>
        <span>سیناریۆی ستراتیژی حوکمڕانی و دیپلۆماسی جیهانی</span>
      </footer>
    </div>
  );
}
