export interface MacroConfig {
  internalDeadzone: number;
  dodgeDeadzone: number;
  hardwareJitter: number;
  groundSense: number;
  aerialSense: number;
  curveExponent: number;
  // Keybindings
  mouseToggle: number;
  mouseSpeedflip: number;
  mouseChaindash: number;
  gkeyFastAerial: number;
  gkeyFwdSpeedflip: number;
  gkeyLeftSpeedflip: number;
  gkeyRightSpeedflip: number;
  // In-game keys
  keyForward: string;
  keyBack: string;
  keyLeft: string;
  keyRight: string;
  keyJump: string;
  keyBoost: string;
  keyPowerslide: string;
  keyAirrollL: string;
  keyAirrollR: string;
  // Timing delays in ms
  fastAerialBoostHold: number;
  fastAerialJump1: number;
  fastAerialJump2Delay: number;
  fastAerialJump2: number;
  fastAerialCancelDelay: number;
  fastAerialCancelHold: number;
  speedflipJump1: number;
  speedflipJump2Delay: number;
  speedflipJump2: number;
  speedflipCancelHold: number;
  chaindashJump1: number;
  chaindashPause: number;
  chaindashJump2: number;
}

export interface MechanicStep {
  name: string;
  startMs: number;
  durationMs: number;
  keys: string[];
  actionDescription: string;
  color: string;
}

export interface MechanicDefinition {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'RLCS Pro';
  totalDurationMs: number;
  description: string;
  proTip: string;
  hotkey: string;
  steps: MechanicStep[];
}

export interface TAInputBinding {
  action: string;
  key: string;
  axisSign?: 'AxisSign_Positive' | 'AxisSign_Negative';
  pressType?: 'BPT_Tap' | 'BPT_Hold';
  bRequired?: boolean;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  model?: string;
  isAudioPlaying?: boolean;
}

export interface InferredSpatialEvent {
  id: string;
  type: 'AERIAL' | 'WALL_HIT' | 'POWER_SHOT';
  title: string;
  timestamp: string;
  location: { x: number; y: number; z: number };
  postHitSpeed: number;
  description: string;
}

export interface OpponentStarvationState {
  isStarved: boolean;
  starvationDurationSec: number;
  opponentBoost: number;
  lastUpdated: number;
}

// Official Psyonix & Epic Games Rocket League Stats API Schemas
export interface RLStatsEnvelope<T = any> {
  Event: string;
  Data: T;
}

export interface RLStatsPlayer {
  Name: string;
  PrimaryId?: string;
  Shortcut: number;
  TeamNum: number;
  Score: number;
  Goals: number;
  Shots: number;
  Assists: number;
  Saves: number;
  Touches: number;
  CarTouches?: number;
  Demos: number;
  Loadout?: string[];
  bHasCar?: boolean;
  Speed?: number;
  Boost?: number;
  bBoosting?: boolean;
  bOnGround?: boolean;
  bOnWall?: boolean;
  bPowersliding?: boolean;
  bDemolished?: boolean;
  bSupersonic?: boolean;
  PickupClass?: string;
  Attacker?: {
    Name: string;
    Shortcut: number;
    TeamNum: number;
  };
}

export interface RLStatsGame {
  Teams: Array<{
    Name: string;
    TeamNum: number;
    Score: number;
    ColorPrimary?: string;
    ColorSecondary?: string;
  }>;
  PlaylistId: number;
  TimeSeconds: number;
  bOvertime: boolean;
  Frame?: number;
  Elapsed?: number;
  Ball: {
    Speed: number;
    TeamNum: number;
  };
  bReplay: boolean;
  bHasWinner: boolean;
  Winner: string;
  Arena: string;
  bHasTarget?: boolean;
  Target?: {
    Name: string;
    Shortcut: number;
    TeamNum: number;
  };
}

export interface RLStatsBallHitEvent {
  MatchGuid?: string;
  Players: Array<{ Name: string; Shortcut: number; TeamNum: number }>;
  Ball: {
    PreHitSpeed: number;
    PostHitSpeed: number;
    Location: { X: number; Y: number; Z: number };
  };
}

export interface RLStatsBoostPickupEvent {
  MatchGuid?: string;
  Player: { Name: string; Shortcut: number; TeamNum: number };
  Location: { X: number; Y: number; Z: number };
  BoostAmount: number;
  BoostType: 'BoostType_Pad' | 'BoostType_Pill';
  bReplay?: boolean;
}

export interface RLStatsGoalScoredEvent {
  MatchGuid?: string;
  GoalSpeed: number;
  GoalTime: number;
  ImpactLocation: { X: number; Y: number; Z: number };
  Scorer: { Name: string; Shortcut: number; TeamNum: number };
  Assister?: { Name: string; Shortcut: number; TeamNum: number };
  BallLastTouch?: {
    Player: { Name: string; Shortcut: number; TeamNum: number };
    Speed: number;
  };
}

export interface RLStatsCrossbarHitEvent {
  MatchGuid?: string;
  BallLocation: { X: number; Y: number; Z: number };
  BallSpeed: number;
  ImpactForce: number;
  BallLastTouch?: {
    Player: { Name: string; Shortcut: number; TeamNum: number };
    Speed: number;
  };
}

export interface RLStatsStatfeedEvent {
  MatchGuid?: string;
  EventName: string;
  Type: string;
  MainTarget: {
    Name: string;
    Shortcut: number;
    TeamNum: number;
  };
  SecondaryTarget?: {
    Name: string;
    Shortcut: number;
    TeamNum: number;
  };
}

export interface RLStatsReplayEvent {
  MatchGuid?: string;
  FileName: string;
  Date: string;
}

export interface RLStatsCommand {
  Command: 'ChangePOV' | 'LoadReplay' | 'SeekReplay' | 'SetGameSpeed' | 'SetHUDVisibility' | 'SetMatchPaused';
  Data: Record<string, any>;
}
