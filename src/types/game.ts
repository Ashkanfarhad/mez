export interface Country {
  id: string;
  nameKu: string;
  nameEn: string;
  flagSvg: string;
  leaderKu: string;
  leaderEn: string;
  leaderTitleKu: string;
  governmentKu: string;
  governmentEn: string;
  ideology: 'Democratic' | 'Autocratic' | 'Monarchic' | 'Federal' | 'Corporatist';
  capitalKu: string;
  capitalEn: string;
  cities: { nameKu: string; nameEn: string; population: string; roleKu: string }[];
  gdpBillions: number;
  militaryPower: number; // 0 - 100
  militaryReadiness: number; // 0 - 100
  relationsWithArven: number; // -100 to +100
  tradeStatusKu: string;
  activeTreaties: string[];
  interestsKu: string[];
  bioKu: string;
  mapCoords: { x: number; y: number; labelX: number; labelY: number };
}

export type AdvisorId = 'rayan' | 'lina' | 'darok' | 'nara' | 'sami' | 'mira';

export interface AdvisorPrivateAgenda {
  personalObjectiveKu: string;
  institutionalObjectiveKu: string;
  privateConcernKu: string;
  redLinesKu: string[];
  knownFactsKu: string[];
  suspicionsKu: string[];
  publicVsPrivateKu: string;
  secretRevealed: boolean;
  revelationTurn?: number;
  revelationSourceKu?: string;
}

export interface AdvisorMemory {
  turn: number;
  summaryKu: string;
  playerStanceKu?: string;
  promiseOrWarningKu?: string;
  unresolvedQuestionKu?: string;
}

export interface RelationshipHistoryEntry {
  turn: number;
  target: 'president' | AdvisorId;
  delta: number;
  newScore: number;
  reasonKu: string;
  timestamp: number;
}

export interface Advisor {
  id: AdvisorId;
  nameKu: string;
  nameEn: string;
  roleKu: string;
  roleEn: string;
  spriteClass: string;
  loyalty: number; // 0 - 100 (general alignment)
  trustInPresident: number; // 0 - 100 (trust in personal integrity/promises)
  respectForJudgment: number; // 0 - 100 (respect for strategic competence)
  influence: number; // 0 - 100
  personalityKu: string;
  agendaKu: string;
  stancesKu: {
    foreign: string;
    economy: string;
    military: string;
  };
  samplePromptsKu: string[];
  privateAgenda: AdvisorPrivateAgenda;
  memories: AdvisorMemory[];
  workingRelationships: Record<AdvisorId, number>; // 0 - 100
  relationshipHistory: RelationshipHistoryEntry[];
}

export interface SideAgreement {
  id: string;
  titleKu: string;
  participants: AdvisorId[];
  purposeKu: string;
  conditionsKu: string;
  status: 'active' | 'fulfilled' | 'broken' | 'discovered';
  turnCreated: number;
  discovered: boolean;
  discoverySourceKu?: string;
  discoveryTurn?: number;
  discoveryReliability: 'verified' | 'high' | 'rumor';
  consequenceKu: string;
}

export interface ActionableProposal {
  id: string;
  titleKu: string;
  proposedBy: AdvisorId | 'player';
  turnProposed: number;
  summaryKu: string;
  costBillion?: number;
  statChanges: Partial<GameStats>;
  relationChanges?: Record<string, number>;
  status: 'pending_confirmation' | 'approved' | 'rejected';
  reasoningKu: string;
}

export interface PoliticalParty {
  id: string;
  nameKu: string;
  nameEn: string;
  color: string;
  seats: number;
  alignment: 'coalition' | 'opposition' | 'neutral';
  loyaltyToPresident: number; // 0 - 100
  ideologyKu: string;
}

export interface CityData {
  id: string;
  nameKu: string;
  nameEn: string;
  image: string;
  population: string;
  specialtyKu: string;
  growthRate: number;
  unemployment: number;
  infrastructureLevel: number;
  activeProjects: string[];
}

export interface BillProposal {
  id: string;
  titleKu: string;
  titleEn: string;
  summaryKu: string;
  category: 'economy' | 'security' | 'welfare' | 'diplomacy';
  supportBreakdown: { for: number; against: number; abstain: number };
  consequencesKu: {
    passed: string;
    failed: string;
  };
  effectsOnPass: Partial<GameStats>;
  status: 'pending' | 'passed' | 'rejected';
}

export interface DelayedConsequence {
  id: string;
  originDecisionTitleKu: string;
  originTurn: number;
  triggerTurn: number;
  headlineKu: string;
  descriptionKu: string;
  statEffects: Partial<GameStats>;
  relationEffects?: { [countryId: string]: number };
  executed: boolean;
}

export interface DecisionOption {
  id: string;
  textKu: string;
  textEn?: string;
  immediateEffects: Partial<GameStats>;
  relationEffects?: { [countryId: string]: number };
  advisorReactions?: { [key in AdvisorId]?: 'support' | 'oppose' | 'neutral' };
  delayedConsequence?: Omit<DelayedConsequence, 'id' | 'originDecisionTitleKu' | 'originTurn' | 'executed'>;
  rationaleKu: string;
}

export interface DecisionCard {
  id: string;
  turnAvailable: number;
  titleKu: string;
  titleEn: string;
  briefKu: string;
  sourceKu: string;
  category: 'crisis' | 'diplomacy' | 'economy' | 'security' | 'parliament';
  options: DecisionOption[];
  isMandatory: boolean;
}

export interface ChronicleRecord {
  id: string;
  turn: number;
  timestamp: number;
  meetingId?: string;
  speakerId?: 'player' | AdvisorId | 'council';
  speakerNameKu?: string;
  titleKu: string;
  contentKu: string;
  category:
    | 'dialogue'
    | 'decision'
    | 'crisis'
    | 'delayed_consequence'
    | 'diplomacy'
    | 'election'
    | 'parliament'
    | 'side_agreement'
    | 'intelligence_leak';
  topicKu?: string;
  isSecret: boolean;
  discoveredTurn?: number;
  discoverySourceKu?: string;
  discoveryReliability?: 'verified' | 'high' | 'rumor';
  trustChanges?: { advisorId: AdvisorId; delta: number; reasonKu: string }[];
  impactSummaryKu?: string;
}

// Backward compatibility alias
export type ChronicleEntry = ChronicleRecord;

export interface GameStats {
  treasuryBillion: number;
  debtBillion: number;
  gdpGrowthPct: number;
  inflationPct: number;
  unemploymentPct: number;
  taxRatePct: number;
  energyReservesPct: number;
  foodReservesPct: number;
  infrastructureIndex: number;
  publicApprovalPct: number;
  governmentStabilityPct: number;
  pressFreedomPct: number;
  militaryReadinessPct: number;
}

export interface ChatMessage {
  id: string;
  turn: number;
  sessionId?: string;
  sender: 'player' | AdvisorId | 'council';
  speakerNameKu?: string;
  textKu: string;
  timestamp: number;
  actionableProposal?: ActionableProposal;
}

export interface GameState {
  version: number;
  turn: number;
  maxTurns: number; // 12 turns till election
  isGameOver: boolean;
  gameEndReasonKu?: string;
  currentSessionId: string;
  rollingSummaryKu: string;
  currentTopicKu: string;
  stats: GameStats;
  advisors: Record<AdvisorId, Advisor>;
  countries: Record<string, Country>;
  parties: PoliticalParty[];
  cities: Record<string, CityData>;
  pendingDecisions: DecisionCard[];
  delayedConsequences: DelayedConsequence[];
  sideAgreements: SideAgreement[];
  pendingProposals: ActionableProposal[];
  chronicle: ChronicleRecord[];
  bills: BillProposal[];
  chatHistory: ChatMessage[];
  activeCrisesCount: number;
  treatiesSigned: {
    countryId: string;
    typeKu: string;
    turnSigned: number;
    descriptionKu: string;
  }[];
}
