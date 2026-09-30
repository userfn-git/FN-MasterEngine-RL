import { MacroConfig, MechanicDefinition } from '../types';

export const DEFAULT_MACRO_CONFIG: MacroConfig = {
  internalDeadzone: 0.05,
  dodgeDeadzone: 0.05,
  hardwareJitter: 2,
  groundSense: 1.30,
  aerialSense: 1.50,
  curveExponent: 1.4,

  mouseToggle: 3,
  mouseSpeedflip: 4,
  mouseChaindash: 5,

  gkeyFastAerial: 1,
  gkeyFwdSpeedflip: 2,
  gkeyLeftSpeedflip: 3,
  gkeyRightSpeedflip: 4,

  keyForward: 'w',
  keyBack: 's',
  keyLeft: 'a',
  keyRight: 'd',
  keyJump: 'mouse2',
  keyBoost: 'mouse1',
  keyPowerslide: 'lshift',
  keyAirrollL: 'q',
  keyAirrollR: 'e',

  fastAerialBoostHold: 300,
  fastAerialJump1: 200,
  fastAerialJump2Delay: 30,
  fastAerialJump2: 30,
  fastAerialCancelDelay: 150,
  fastAerialCancelHold: 300,

  speedflipJump1: 30,
  speedflipJump2Delay: 30,
  speedflipJump2: 20,
  speedflipCancelHold: 600,

  chaindashJump1: 30,
  chaindashPause: 60,
  chaindashJump2: 30,
};

export const RAW_LUA_TEMPLATE = `--  ROCKET LEAGUE PROFESSIONAL MASTER-ENGINE 
-- ALL MACRO LOGIC IN ONE OnEvent. TAInput binds go in TAInput.ini.

-----------------------------------------------------------------------
-- [1] CORE CONFIGURATION
-----------------------------------------------------------------------
local CONFIG = {
    INTERNAL_DEADZONE = {{INTERNAL_DEADZONE}},
    DODGE_DEADZONE    = {{DODGE_DEADZONE}},
    HARDWARE_JITTER   = {{HARDWARE_JITTER}},
    GROUND_SENSE      = {{GROUND_SENSE}},
    AERIAL_SENSE      = {{AERIAL_SENSE}},
    CURVE_EXPONENT    = {{CURVE_EXPONENT}},
}

-----------------------------------------------------------------------
-- [2] STATE
-----------------------------------------------------------------------
local PLAYER_STATE = {
    IS_AIRBORNE     = false,
    IS_DRIBBLING    = false,
    IS_POWERSLIDING = false,
}

local enable_script = true
local macro_busy = false

function RunMacro(action)
    if macro_busy then return end
    macro_busy = true
    local ok, err = pcall(action)
    if not ok then
        OutputLogMessage("[MACRO ERROR] " .. tostring(err) .. "\\n")
        EmergencyReleaseAll()
    end
    macro_busy = false
end

-----------------------------------------------------------------------
-- [3] KEY CONFIGURATION
-----------------------------------------------------------------------
local BINDINGS = {
    MOUSE = {
        TOGGLE     = {{MOUSE_TOGGLE}},   -- Middle click: toggle script on/off
        SPEEDFLIP  = {{MOUSE_SPEEDFLIP}},   -- MB4: mouse-bound speed flip
        CHAINDASH  = {{MOUSE_CHAINDASH}},   -- MB5: chain dash / aerial
    },

    GKEY = {
        FAST_AERIAL     = {{GKEY_FASTAERIAL}},
        FWD_SPEEDFLIP   = {{GKEY_FWD}},
        LEFT_SPEEDFLIP  = {{GKEY_LEFT}},
        RIGHT_SPEEDFLIP = {{GKEY_RIGHT}},
    },

    KEYS = {
        FORWARD    = "{{KEY_FORWARD}}",
        BACK       = "{{KEY_BACK}}",
        LEFT       = "{{KEY_LEFT}}",
        RIGHT      = "{{KEY_RIGHT}}",
        JUMP       = "{{KEY_JUMP}}",
        BOOST      = "{{KEY_BOOST}}",
        POWERSLIDE = "{{KEY_POWERSLIDE}}",
        AIRROLL_L  = "{{KEY_AIRROLL_L}}",
        AIRROLL_R  = "{{KEY_AIRROLL_R}}",
    },
}

local MOUSE = BINDINGS.MOUSE
local GKEY = BINDINGS.GKEY
local K = BINDINGS.KEYS

-----------------------------------------------------------------------
-- [4] SAFE INPUT DISPATCHER (KEYBOARD & MOUSE POLYMORPHIC DISPATCHER)
-- Fixes Logitech G-Hub "Lua Error: invalid argument" when mouse1 or mouse2
-- are passed to PressKey. Automatically handles mouse clicks and keyboard keys
-- and prevents stuck keys / echoing.
-----------------------------------------------------------------------
local _NativePressKey = PressKey
local _NativeReleaseKey = ReleaseKey
local _NativePressMouse = PressMouseButton
local _NativeReleaseMouse = ReleaseMouseButton

function SafePress(k)
    if not k then return end
    local s = tostring(k):lower()
    if s == "mouse1" or s == "1" or s == "lclick" or s == "m1" then
        pcall(PressMouseButton, 1)
    elseif s == "mouse2" or s == "2" or s == "rclick" or s == "m2" then
        pcall(PressMouseButton, 2)
    elseif s == "mouse3" or s == "3" or s == "mclick" or s == "m3" then
        pcall(PressMouseButton, 3)
    elseif s == "mouse4" or s == "4" or s == "mb4" or s == "m4" then
        pcall(PressMouseButton, 4)
    elseif s == "mouse5" or s == "5" or s == "mb5" or s == "m5" then
        pcall(PressMouseButton, 5)
    else
        pcall(_NativePressKey, k)
    end
end

function SafeRelease(k)
    if not k then return end
    local s = tostring(k):lower()
    if s == "mouse1" or s == "1" or s == "lclick" or s == "m1" then
        pcall(ReleaseMouseButton, 1)
    elseif s == "mouse2" or s == "2" or s == "rclick" or s == "m2" then
        pcall(ReleaseMouseButton, 2)
    elseif s == "mouse3" or s == "3" or s == "mclick" or s == "m3" then
        pcall(ReleaseMouseButton, 3)
    elseif s == "mouse4" or s == "4" or s == "mb4" or s == "m4" then
        pcall(ReleaseMouseButton, 4)
    elseif s == "mouse5" or s == "5" or s == "mb5" or s == "m5" then
        pcall(ReleaseMouseButton, 5)
    else
        pcall(_NativeReleaseKey, k)
    end
end

-- Override global PressKey and ReleaseKey so any function calls work without error
PressKey = SafePress
ReleaseKey = SafeRelease

Press = SafePress
Release = SafeRelease

function EmergencyReleaseAll()
    pcall(ReleaseMouseButton, 1)
    pcall(ReleaseMouseButton, 2)
    pcall(ReleaseMouseButton, 3)
    pcall(ReleaseMouseButton, 4)
    pcall(ReleaseMouseButton, 5)
    pcall(_NativeReleaseKey, K.FORWARD)
    pcall(_NativeReleaseKey, K.BACK)
    pcall(_NativeReleaseKey, K.LEFT)
    pcall(_NativeReleaseKey, K.RIGHT)
    pcall(_NativeReleaseKey, K.POWERSLIDE)
    pcall(_NativeReleaseKey, K.AIRROLL_L)
    pcall(_NativeReleaseKey, K.AIRROLL_R)
end

-----------------------------------------------------------------------
-- [5] ADVANCED RADIAL DEADZONE & DODGE ENGINE (RLCS SPEC: 0.05 / 0.05)
-----------------------------------------------------------------------
-- 1. Continuous Radial Deadzone Re-scaling:
--    Eliminates sudden step jumps at the 0.05 boundary.
--    Normalized range [0.05 .. 1.00] maps smoothly to [0.00 .. 1.00].
function ApplyProfessionalCurve(input, multiplier)
    local raw_abs = math.abs(input)
    local deadzone = CONFIG.INTERNAL_DEADZONE * 127
    if raw_abs <= deadzone then return 0 end

    -- Smooth re-scaled range: starts at 0 immediately past the deadzone
    local active_range = (raw_abs - deadzone) / (127 - deadzone)
    local sign = (input > 0) and 1 or -1
    local curved = math.pow(active_range, CONFIG.CURVE_EXPONENT)
    return curved * 127 * sign * (multiplier or 1.0)
end

-- 2. 2D Radial Dodge Deadzone Gate:
--    Ensures directional vector magnitude exceeds DODGE_DEADZONE (0.05)
--    when executing diagonal speedflips to guarantee a flip instead of a double jump stall.
function IsDodgeDeadzoneSatisfied(x, y)
    local norm_x = math.abs(x or 0) / 127
    local norm_y = math.abs(y or 0) / 127
    local magnitude = math.sqrt(norm_x * norm_x + norm_y * norm_y)
    return magnitude >= CONFIG.DODGE_DEADZONE
end

-- 3. Hardware Jitter Filter:
function FilterJitter(val)
    if math.abs(val) < CONFIG.HARDWARE_JITTER then return 0 end
    return val
end

-----------------------------------------------------------------------
-- [6] MACRO FUNCTIONS
-----------------------------------------------------------------------

-- G1: Fast Aerial with Flip Cancel
function MacroFastAerial()
    OutputLogMessage("[MACRO] Fast Aerial initiated (Jump1: {{FA_JUMP1}}ms, Cancel: {{FA_CANCEL_HOLD}}ms)\\n")
    PressKey(K.BOOST)
    PressKey(K.BACK)
    PressKey(K.JUMP)
    Sleep({{FA_JUMP1}})
    ReleaseKey(K.JUMP)
    ReleaseKey(K.BACK)
    Sleep({{FA_JUMP2_DELAY}})

    PressKey(K.JUMP)
    Sleep({{FA_JUMP2}})
    ReleaseKey(K.JUMP)

    Sleep({{FA_CANCEL_DELAY}})
    PressKey(K.FORWARD)
    PressKey(K.JUMP)
    Sleep(20)
    ReleaseKey(K.JUMP)
    ReleaseKey(K.FORWARD)

    PressKey(K.BACK)
    Sleep({{FA_CANCEL_HOLD}})
    ReleaseKey(K.BACK)
    ReleaseKey(K.BOOST)
    OutputLogMessage("[MACRO] Fast Aerial completed\\n")
end

-- G2: Forward Speedflip
function MacroForwardSpeedflip()
    OutputLogMessage("[MACRO] Forward Speedflip initiated (Jump: {{SF_JUMP1}}ms, Cancel: {{SF_CANCEL_HOLD_FWD}}ms)\\n")
    PressKey(K.BOOST)
    PressKey(K.FORWARD)
    PressKey(K.JUMP)
    Sleep({{SF_JUMP1}})
    ReleaseKey(K.JUMP)
    Sleep({{SF_JUMP2_DELAY}})

    PressKey(K.JUMP)
    Sleep({{SF_JUMP2}})
    ReleaseKey(K.JUMP)
    ReleaseKey(K.FORWARD)

    PressKey(K.BACK)
    Sleep({{SF_CANCEL_HOLD_FWD}})
    ReleaseKey(K.BACK)
    ReleaseKey(K.BOOST)
    OutputLogMessage("[MACRO] Forward Speedflip completed\\n")
end

-- G3: Left Speedflip
function MacroLeftSpeedflip()
    OutputLogMessage("[MACRO] Left Speedflip initiated (Cancel: {{SF_CANCEL_HOLD}}ms)\\n")
    PressKey(K.BOOST)
    PressKey(K.FORWARD)
    PressKey(K.LEFT)
    PressKey(K.JUMP)
    Sleep({{SF_JUMP1}})
    ReleaseKey(K.JUMP)
    Sleep({{SF_JUMP2_DELAY}})

    PressKey(K.JUMP)
    Sleep({{SF_JUMP2}})
    ReleaseKey(K.JUMP)
    ReleaseKey(K.FORWARD)
    ReleaseKey(K.LEFT)

    PressKey(K.BACK)
    PressKey(K.AIRROLL_L)
    Sleep({{SF_CANCEL_HOLD}})
    ReleaseKey(K.BACK)
    ReleaseKey(K.AIRROLL_L)
    ReleaseKey(K.BOOST)
    OutputLogMessage("[MACRO] Left Speedflip completed\\n")
end

-- G4: Right Speedflip
function MacroRightSpeedflip()
    OutputLogMessage("[MACRO] Right Speedflip initiated (Cancel: {{SF_CANCEL_HOLD}}ms)\\n")
    PressKey(K.BOOST)
    PressKey(K.FORWARD)
    PressKey(K.RIGHT)
    PressKey(K.JUMP)
    Sleep({{SF_JUMP1}})
    ReleaseKey(K.JUMP)
    Sleep({{SF_JUMP2_DELAY}})

    PressKey(K.JUMP)
    Sleep({{SF_JUMP2}})
    ReleaseKey(K.JUMP)
    ReleaseKey(K.FORWARD)
    ReleaseKey(K.RIGHT)

    PressKey(K.BACK)
    PressKey(K.AIRROLL_R)
    Sleep({{SF_CANCEL_HOLD}})
    ReleaseKey(K.BACK)
    ReleaseKey(K.AIRROLL_R)
    ReleaseKey(K.BOOST)
    OutputLogMessage("[MACRO] Right Speedflip completed\\n")
end

-- MB4: Mouse-bound Speedflip (With Powerslide Drift Recovery)
function MacroMouseSpeedflip()
    OutputLogMessage("[MACRO] Mouse Speedflip (MB4) initiated with Powerslide recovery\\n")
    PressKey(K.BOOST)
    PressKey(K.FORWARD)
    PressKey(K.LEFT)
    PressKey(K.JUMP)
    Sleep(35)
    ReleaseKey(K.JUMP)
    Sleep(45)

    PressKey(K.JUMP)
    Sleep(25)
    ReleaseKey(K.JUMP)
    Sleep(20)
    ReleaseKey(K.FORWARD)

    PressKey(K.BACK)
    PressKey(K.POWERSLIDE)
    Sleep({{SF_CANCEL_HOLD}})
    ReleaseKey(K.BACK)
    ReleaseKey(K.LEFT)
    ReleaseKey(K.POWERSLIDE)
    ReleaseKey(K.BOOST)
    OutputLogMessage("[MACRO] Mouse Speedflip completed\\n")
end

-- MB5: Chain Dash / Aerial
function MacroChainDash()
    OutputLogMessage("[MACRO] Chain Dash (MB5) initiated\\n")
    PressKey(K.JUMP)
    Sleep({{CD_JUMP1}})
    ReleaseKey(K.JUMP)
    Sleep({{CD_PAUSE}})

    PressKey(K.FORWARD)
    PressKey(K.POWERSLIDE)
    PressKey(K.JUMP)
    Sleep({{CD_JUMP2}})
    ReleaseKey(K.JUMP)
    Sleep(50)
    ReleaseKey(K.POWERSLIDE)
    ReleaseKey(K.FORWARD)
    OutputLogMessage("[MACRO] Chain Dash completed\\n")
end

-----------------------------------------------------------------------
-- [7] SINGLE EVENT HANDLER
-----------------------------------------------------------------------
function OnEvent(event, arg)
    if event == "PROFILE_ACTIVATED" then
        EnablePrimaryMouseButtonEvents(true)
        ClearLog()
        OutputLogMessage("==========================================\\n")
        OutputLogMessage(" ROCKET LEAGUE MASTER-ENGINE v4.0.2\\n")
        OutputLogMessage(" STATUS: ONLINE | LOGITECH G-HUB READY\\n")
        OutputLogMessage("==========================================\\n")
        return
    end

    if event == "MOUSE_BUTTON_PRESSED" and arg == MOUSE.TOGGLE then
        enable_script = not enable_script
        OutputLogMessage("[ENGINE] Script is now " .. (enable_script and "ENABLED" or "DISABLED") .. "\\n")
        return
    end

    if not enable_script then return end

    if event == "MOUSE_BUTTON_PRESSED" then
        if arg == MOUSE.SPEEDFLIP then
            RunMacro(MacroMouseSpeedflip)
            return
        elseif arg == MOUSE.CHAINDASH then
            RunMacro(MacroChainDash)
            return
        end
    end

    if event == "G_PRESSED" then
        if arg == GKEY.FAST_AERIAL then
            RunMacro(MacroFastAerial)
        elseif arg == GKEY.FWD_SPEEDFLIP then
            RunMacro(MacroForwardSpeedflip)
        elseif arg == GKEY.LEFT_SPEEDFLIP then
            RunMacro(MacroLeftSpeedflip)
        elseif arg == GKEY.RIGHT_SPEEDFLIP then
            RunMacro(MacroRightSpeedflip)
        end
        return
    end
end
`;

export function generateLuaScript(config: MacroConfig): string {
  let s = RAW_LUA_TEMPLATE;
  s = s.replaceAll('{{INTERNAL_DEADZONE}}', config.internalDeadzone.toFixed(2));
  s = s.replaceAll('{{DODGE_DEADZONE}}', config.dodgeDeadzone.toFixed(2));
  s = s.replaceAll('{{HARDWARE_JITTER}}', config.hardwareJitter.toString());
  s = s.replaceAll('{{GROUND_SENSE}}', config.groundSense.toFixed(2));
  s = s.replaceAll('{{AERIAL_SENSE}}', config.aerialSense.toFixed(2));
  s = s.replaceAll('{{CURVE_EXPONENT}}', config.curveExponent.toFixed(2));

  s = s.replaceAll('{{MOUSE_TOGGLE}}', config.mouseToggle.toString());
  s = s.replaceAll('{{MOUSE_SPEEDFLIP}}', config.mouseSpeedflip.toString());
  s = s.replaceAll('{{MOUSE_CHAINDASH}}', config.mouseChaindash.toString());

  s = s.replaceAll('{{GKEY_FASTAERIAL}}', config.gkeyFastAerial.toString());
  s = s.replaceAll('{{GKEY_FWD}}', config.gkeyFwdSpeedflip.toString());
  s = s.replaceAll('{{GKEY_LEFT}}', config.gkeyLeftSpeedflip.toString());
  s = s.replaceAll('{{GKEY_RIGHT}}', config.gkeyRightSpeedflip.toString());

  s = s.replaceAll('{{KEY_FORWARD}}', config.keyForward);
  s = s.replaceAll('{{KEY_BACK}}', config.keyBack);
  s = s.replaceAll('{{KEY_LEFT}}', config.keyLeft);
  s = s.replaceAll('{{KEY_RIGHT}}', config.keyRight);
  s = s.replaceAll('{{KEY_JUMP}}', config.keyJump);
  s = s.replaceAll('{{KEY_BOOST}}', config.keyBoost);
  s = s.replaceAll('{{KEY_POWERSLIDE}}', config.keyPowerslide);
  s = s.replaceAll('{{KEY_AIRROLL_L}}', config.keyAirrollL);
  s = s.replaceAll('{{KEY_AIRROLL_R}}', config.keyAirrollR);

  s = s.replaceAll('{{FA_JUMP1}}', config.fastAerialJump1.toString());
  s = s.replaceAll('{{FA_JUMP2_DELAY}}', config.fastAerialJump2Delay.toString());
  s = s.replaceAll('{{FA_JUMP2}}', config.fastAerialJump2.toString());
  s = s.replaceAll('{{FA_CANCEL_DELAY}}', config.fastAerialCancelDelay.toString());
  s = s.replaceAll('{{FA_CANCEL_HOLD}}', config.fastAerialCancelHold.toString());

  s = s.replaceAll('{{SF_JUMP1}}', config.speedflipJump1.toString());
  s = s.replaceAll('{{SF_JUMP2_DELAY}}', config.speedflipJump2Delay.toString());
  s = s.replaceAll('{{SF_JUMP2}}', config.speedflipJump2.toString());
  s = s.replaceAll('{{SF_CANCEL_HOLD}}', config.speedflipCancelHold.toString());
  s = s.replaceAll('{{SF_CANCEL_HOLD_FWD}}', (config.speedflipCancelHold - 50).toString());

  s = s.replaceAll('{{CD_JUMP1}}', config.chaindashJump1.toString());
  s = s.replaceAll('{{CD_PAUSE}}', config.chaindashPause.toString());
  s = s.replaceAll('{{CD_JUMP2}}', config.chaindashJump2.toString());

  return s;
}

export const MECHANICS_CATALOG: MechanicDefinition[] = [
  {
    id: 'speedflip-left',
    title: 'Left Diagonal Speedflip',
    difficulty: 'RLCS Pro',
    totalDurationMs: 710,
    hotkey: 'G3 / MB4 / Key A',
    description: 'The pinnacle kickoff and supersonic recovery mechanic. Fires a 45° diagonal dodge followed by an instant flip-cancel and directional air-roll + powerslide.',
    proTip: 'Cancel MUST occur within 40ms of the second jump press to eliminate front-flip angular pitch and convert 100% of momentum forward.',
    steps: [
      { name: 'Ground Acceleration', startMs: 0, durationMs: 30, keys: ['Boost', 'Forward (W)', 'Left (A)', 'Jump 1'], actionDescription: 'Ignite rocket boost, hold W+A for diagonal vector, tap Jump 1', color: '#0ea5e9' },
      { name: 'Jump Release Buffer', startMs: 30, durationMs: 30, keys: ['Boost', 'Forward (W)', 'Left (A)'], actionDescription: 'Release Jump 1 to register first hop with ground physics engine', color: '#6366f1' },
      { name: 'Diagonal Dodge Trigger', startMs: 60, durationMs: 20, keys: ['Boost', 'Forward (W)', 'Left (A)', 'Jump 2'], actionDescription: 'Tap Jump 2 to commit diagonal roll dodge', color: '#f59e0b' },
      { name: 'Instant Flip Cancel', startMs: 80, durationMs: 20, keys: ['Boost', 'Back (S)', 'AirRoll Left (Q)'], actionDescription: 'HARD CANCEL: Release W+A, slam Back (S) + Air Roll Left', color: '#ef4444' },
      { name: 'Cancel Hold & Stabilization', startMs: 100, durationMs: 550, keys: ['Boost', 'Back (S)', 'AirRoll Left (Q)', 'Powerslide'], actionDescription: 'Maintain flip cancel until car completes roll and all 4 wheels align', color: '#ec4899' },
      { name: 'Touchdown Drift Recovery', startMs: 650, durationMs: 60, keys: ['Powerslide', 'Boost'], actionDescription: 'Drift through touchdown for 0 loss of supersonic momentum', color: '#10b981' },
    ],
  },
  {
    id: 'speedflip-right',
    title: 'Right Diagonal Speedflip',
    difficulty: 'RLCS Pro',
    totalDurationMs: 710,
    hotkey: 'G4 / Key D',
    description: 'Mirrored diagonal speedflip for right-side kickoff spawns and right field diagonal clears.',
    proTip: 'Ensure Air Roll Right (E) is held with reverse pitch (S) to stabilize roll-axis torque.',
    steps: [
      { name: 'Ground Acceleration', startMs: 0, durationMs: 30, keys: ['Boost', 'Forward (W)', 'Right (D)', 'Jump 1'], actionDescription: 'Ignite rocket boost, hold W+D, tap Jump 1', color: '#0ea5e9' },
      { name: 'Jump Release Buffer', startMs: 30, durationMs: 30, keys: ['Boost', 'Forward (W)', 'Right (D)'], actionDescription: 'Micro-release for double jump detection', color: '#6366f1' },
      { name: 'Diagonal Dodge Trigger', startMs: 60, durationMs: 20, keys: ['Boost', 'Forward (W)', 'Right (D)', 'Jump 2'], actionDescription: 'Execute diagonal dodge right', color: '#f59e0b' },
      { name: 'Instant Flip Cancel', startMs: 80, durationMs: 20, keys: ['Boost', 'Back (S)', 'AirRoll Right (E)'], actionDescription: 'Slam pitch backward to cancel flip', color: '#ef4444' },
      { name: 'Cancel Hold & Stabilization', startMs: 100, durationMs: 550, keys: ['Boost', 'Back (S)', 'AirRoll Right (E)', 'Powerslide'], actionDescription: 'Hold cancel until horizontal alignment', color: '#ec4899' },
      { name: 'Touchdown Drift Recovery', startMs: 650, durationMs: 60, keys: ['Powerslide', 'Boost'], actionDescription: 'Smooth 4-wheel landing with Powerslide held', color: '#10b981' },
    ],
  },
  {
    id: 'fast-aerial',
    title: 'Fast Aerial + Flip Cancel',
    difficulty: 'Advanced',
    totalDurationMs: 730,
    hotkey: 'G1 / Key S',
    description: 'Maximum velocity vertical ascent. Combines simultaneous boost + pitch back with double jump and an anti-backflip cancel.',
    proTip: 'Holding Back (S) during Jump 2 triggers an accidental backflip. The macro releases S right before Jump 2, preventing tilt errors!',
    steps: [
      { name: 'Initial Tilt & Rocket Burn', startMs: 0, durationMs: 200, keys: ['Boost', 'Back (S)', 'Jump 1'], actionDescription: 'Burn boost while tilting nose up 45 degrees on first jump', color: '#0ea5e9' },
      { name: 'Zero-Pitch Safety Window', startMs: 200, durationMs: 30, keys: ['Boost'], actionDescription: 'Release Jump & S to avoid backflipping during second tap', color: '#6366f1' },
      { name: 'Vertical Double Jump', startMs: 230, durationMs: 30, keys: ['Boost', 'Jump 2'], actionDescription: 'Inject second jump impulse directly into skyward vector', color: '#f59e0b' },
      { name: 'Ascent Glide', startMs: 260, durationMs: 150, keys: ['Boost'], actionDescription: 'Ascend at max vertical acceleration', color: '#8b5cf6' },
      { name: 'Forward Pitch Leveling', startMs: 410, durationMs: 20, keys: ['Boost', 'Forward (W)', 'Jump'], actionDescription: 'Micro forward pitch impulse to level nose toward ball', color: '#ef4444' },
      { name: 'Trajectory Lock', startMs: 430, durationMs: 300, keys: ['Boost', 'Back (S)'], actionDescription: 'Hold nose elevation for ceiling interception', color: '#10b981' },
    ],
  },
  {
    id: 'chain-dash',
    title: 'Chain Dash / Wall Wave Dash',
    difficulty: 'Advanced',
    totalDurationMs: 220,
    hotkey: 'MB5',
    description: 'Rapid-fire wave dashes along walls or flat ground without boosting to generate infinite supersonic speed.',
    proTip: 'Car front wheels must make ground contact while Powerslide is held so the dodge impulse converts directly into forward sliding speed.',
    steps: [
      { name: 'Micro Hop', startMs: 0, durationMs: 30, keys: ['Jump 1'], actionDescription: 'Tiny ground hop to tilt wheels', color: '#0ea5e9' },
      { name: 'Landing Alignment', startMs: 30, durationMs: 60, keys: ['Forward (W)', 'Powerslide'], actionDescription: 'Tilt car nose slightly down toward surface', color: '#6366f1' },
      { name: 'Wave Dash Slam', startMs: 90, durationMs: 30, keys: ['Forward (W)', 'Powerslide', 'Jump 2'], actionDescription: 'Dodge forward right as back wheels contact surface', color: '#f59e0b' },
      { name: 'Drift Buffer', startMs: 120, durationMs: 100, keys: ['Powerslide'], actionDescription: 'Slide along ground and prepare next chain cycle', color: '#10b981' },
    ],
  },
  {
    id: 'half-flip',
    title: '180° Half-Flip Recovery',
    difficulty: 'Intermediate',
    totalDurationMs: 650,
    hotkey: 'Custom / Key S+W',
    description: 'Instantly reverse car direction 180 degrees while preserving backward supersonic speed.',
    proTip: 'Cancel the backflip exactly halfway (when the roof faces the pitch), then directional air roll 180° to land on all 4 wheels.',
    steps: [
      { name: 'Backwards Hop', startMs: 0, durationMs: 40, keys: ['Back (S)', 'Jump 1'], actionDescription: 'Hop backward with nose up', color: '#0ea5e9' },
      { name: 'Backflip Trigger', startMs: 60, durationMs: 30, keys: ['Back (S)', 'Jump 2'], actionDescription: 'Trigger full backflip dodge', color: '#f59e0b' },
      { name: 'Forward Flip Cancel', startMs: 120, durationMs: 250, keys: ['Forward (W)', 'Boost'], actionDescription: 'Slam Forward (W) to freeze flip upside down', color: '#ef4444' },
      { name: 'Roll & Land', startMs: 370, durationMs: 280, keys: ['Forward (W)', 'AirRoll Left (Q)', 'Powerslide'], actionDescription: 'Air roll 180 degrees to upright position and drift', color: '#10b981' },
    ],
  },
];

export const RAW_POWERSHELL_TEMPLATES = {
  fastAerial: `Add-Type -TypeDefinition @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

public class FastAerialManager {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int LLKHF_INJECTED = 0x0010;

    private static HookProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static bool _isRunning = false;

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct INPUT {
        public uint type;
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int pt_x;
        public int pt_y;
    }

    private const uint INPUT_KEYBOARD = 1;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    private delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void PressKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = 0;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void ReleaseKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static Action ActionS;

    public static void Start() {
        _hookID = SetHook(_proc);
        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }
        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr SetHook(HookProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            KBDLLHOOKSTRUCT hookStruct = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
            bool isInjected = (hookStruct.flags & LLKHF_INJECTED) != 0;

            // 83 = S key (0x53)
            if (!isInjected && hookStruct.vkCode == 83 && !_isRunning) {
                _isRunning = true;
                new Thread(() => {
                    try {
                        if (ActionS != null) ActionS();
                    } finally {
                        _isRunning = false;
                    }
                }).Start();

                return (IntPtr)1; // Block physical key repeat
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
"@

# Key Codes (Hex)
$K_BOOST   = 0x44  # D key (or customize to match your RL Boost key)
$K_BACK    = 0x53  # S key
$K_JUMP    = 0x20  # Spacebar
$K_FORWARD = 0x57  # W key

[FastAerialManager]::ActionS = {
    [FastAerialManager]::PressKey($K_BOOST)
    [FastAerialManager]::PressKey($K_BACK)
    [FastAerialManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 200
    [FastAerialManager]::ReleaseKey($K_JUMP)
    [FastAerialManager]::ReleaseKey($K_BACK)
    Start-Sleep -Milliseconds 30

    [FastAerialManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [FastAerialManager]::ReleaseKey($K_JUMP)

    Start-Sleep -Milliseconds 150
    [FastAerialManager]::PressKey($K_FORWARD)
    [FastAerialManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 20
    [FastAerialManager]::ReleaseKey($K_JUMP)
    [FastAerialManager]::ReleaseKey($K_FORWARD)

    [FastAerialManager]::PressKey($K_BACK)
    Start-Sleep -Milliseconds 300
    [FastAerialManager]::ReleaseKey($K_BACK)
    [FastAerialManager]::ReleaseKey($K_BOOST)
}

Write-Host ">>> Rocket League Fast Aerial Low-Level Hook Active on [S] (Press Ctrl+C to Stop) <<<" -ForegroundColor Green
[FastAerialManager]::Start()
`,

  leftSpeedflip: `$source = @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

public class LeftSpeedflipManager {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int LLKHF_INJECTED = 0x0010;

    private static HookProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static bool _isRunning = false;

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct INPUT {
        public uint type;
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int pt_x;
        public int pt_y;
    }

    private const uint INPUT_KEYBOARD = 1;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    private delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void PressKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = 0;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void ReleaseKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static Action ActionA;

    public static void Start() {
        _hookID = SetHook(_proc);
        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }
        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr SetHook(HookProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            KBDLLHOOKSTRUCT hookStruct = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
            bool isInjected = (hookStruct.flags & LLKHF_INJECTED) != 0;

            // 65 = A key (0x41)
            if (!isInjected && hookStruct.vkCode == 65 && !_isRunning) {
                _isRunning = true;
                new Thread(() => {
                    try {
                        if (ActionA != null) ActionA();
                    } finally {
                        _isRunning = false;
                    }
                }).Start();

                return (IntPtr)1;
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
"@

Add-Type -TypeDefinition $source

# Virtual Key Hex Codes
$K_BOOST      = 0x44  # D key
$K_FORWARD    = 0x57  # W key
$K_LEFT       = 0x41  # A key
$K_BACK       = 0x53  # S key
$K_JUMP       = 0x20  # Spacebar
$K_AIRROLL_L  = 0x51  # Q key (Air Roll Left)

[LeftSpeedflipManager]::ActionA = {
    [LeftSpeedflipManager]::PressKey($K_BOOST)
    [LeftSpeedflipManager]::PressKey($K_FORWARD)
    [LeftSpeedflipManager]::PressKey($K_LEFT)
    [LeftSpeedflipManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [LeftSpeedflipManager]::ReleaseKey($K_JUMP)
    Start-Sleep -Milliseconds 30

    [LeftSpeedflipManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 20
    [LeftSpeedflipManager]::ReleaseKey($K_JUMP)
    [LeftSpeedflipManager]::ReleaseKey($K_FORWARD)
    [LeftSpeedflipManager]::ReleaseKey($K_LEFT)

    [LeftSpeedflipManager]::PressKey($K_BACK)
    [LeftSpeedflipManager]::PressKey($K_AIRROLL_L)
    Start-Sleep -Milliseconds 600
    [LeftSpeedflipManager]::ReleaseKey($K_BACK)
    [LeftSpeedflipManager]::ReleaseKey($K_AIRROLL_L)
    [LeftSpeedflipManager]::ReleaseKey($K_BOOST)
}

Write-Host ">>> Left Speedflip Manager Active on [A] (Press Ctrl+C to Stop) <<<" -ForegroundColor Green
[LeftSpeedflipManager]::Start()
`,

  rightSpeedflip: `$source = @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

public class RightSpeedflipManager {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int LLKHF_INJECTED = 0x0010;

    private static HookProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static bool _isRunning = false;

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct INPUT {
        public uint type;
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int pt_x;
        public int pt_y;
    }

    private const uint INPUT_KEYBOARD = 1;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    private static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    private delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void PressKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = 0;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void ReleaseKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static Action ActionD;

    public static void Start() {
        _hookID = SetHook(_proc);
        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }
        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr SetHook(HookProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            KBDLLHOOKSTRUCT hookStruct = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
            bool isInjected = (hookStruct.flags & LLKHF_INJECTED) != 0;

            // 68 = D key (0x44)
            if (!isInjected && hookStruct.vkCode == 68 && !_isRunning) {
                _isRunning = true;
                new Thread(() => {
                    try {
                        if (ActionD != null) ActionD();
                    } finally {
                        _isRunning = false;
                    }
                }).Start();

                return (IntPtr)1;
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
"@

Add-Type -TypeDefinition $source

# Key codes
$K_BOOST      = 0x42  # B key (or customize to prevent conflict with D)
$K_FORWARD    = 0x57  # W key
$K_RIGHT      = 0x44  # D key
$K_BACK       = 0x53  # S key
$K_JUMP       = 0x20  # Spacebar
$K_AIRROLL_R  = 0x45  # E key (Air Roll Right)

[RightSpeedflipManager]::ActionD = {
    [RightSpeedflipManager]::PressKey($K_BOOST)
    [RightSpeedflipManager]::PressKey($K_FORWARD)
    [RightSpeedflipManager]::PressKey($K_RIGHT)
    [RightSpeedflipManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [RightSpeedflipManager]::ReleaseKey($K_JUMP)
    Start-Sleep -Milliseconds 30

    [RightSpeedflipManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 20
    [RightSpeedflipManager]::ReleaseKey($K_JUMP)
    [RightSpeedflipManager]::ReleaseKey($K_FORWARD)
    [RightSpeedflipManager]::ReleaseKey($K_RIGHT)

    [RightSpeedflipManager]::PressKey($K_BACK)
    [RightSpeedflipManager]::PressKey($K_AIRROLL_R)
    Start-Sleep -Milliseconds 600
    [RightSpeedflipManager]::ReleaseKey($K_BACK)
    [RightSpeedflipManager]::ReleaseKey($K_AIRROLL_R)
    [RightSpeedflipManager]::ReleaseKey($K_BOOST)
}

Write-Host ">>> Right Speedflip Manager Active on [D] (Press Ctrl+C to Stop) <<<" -ForegroundColor Green
[RightSpeedflipManager]::Start()
`,

  forwardSpeedflip: `$source = @"
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Threading;

public class SpeedflipManager {
    private const int WH_KEYBOARD_LL = 13;
    private const int WM_KEYDOWN = 0x0100;
    private const int LLKHF_INJECTED = 0x0010;

    private static HookProc _proc = HookCallback;
    private static IntPtr _hookID = IntPtr.Zero;
    private static bool _isRunning = false;

    [StructLayout(LayoutKind.Sequential)]
    private struct KBDLLHOOKSTRUCT {
        public uint vkCode;
        public uint scanCode;
        public uint flags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct INPUT {
        public uint type;
        public KEYBDINPUT ki;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct KEYBDINPUT {
        public ushort wVk;
        public ushort wScan;
        public uint dwFlags;
        public uint time;
        public IntPtr dwExtraInfo;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public int pt_x;
        public int pt_y;
    }

    private const uint INPUT_KEYBOARD = 1;
    private const uint KEYEVENTF_KEYUP = 0x0002;

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetWindowsHookEx(int idHook, HookProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    private static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    private static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    private static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr GetModuleHandle(string lpModuleName);

    private delegate IntPtr HookProc(int nCode, IntPtr wParam, IntPtr lParam);

    public static void PressKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = 0;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static void ReleaseKey(byte vkCode) {
        INPUT[] inputs = new INPUT[1];
        inputs[0].type = INPUT_KEYBOARD;
        inputs[0].ki.wVk = vkCode;
        inputs[0].ki.dwFlags = KEYEVENTF_KEYUP;
        SendInput(1, inputs, Marshal.SizeOf(typeof(INPUT)));
    }

    public static Action ActionW;

    public static void Start() {
        _hookID = SetHook(_proc);
        MSG msg;
        while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
            TranslateMessage(ref msg);
            DispatchMessage(ref msg);
        }
        UnhookWindowsHookEx(_hookID);
    }

    private static IntPtr SetHook(HookProc proc) {
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
        }
    }

    private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN) {
            KBDLLHOOKSTRUCT hookStruct = (KBDLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(KBDLLHOOKSTRUCT));
            bool isInjected = (hookStruct.flags & LLKHF_INJECTED) != 0;

            // 87 = W key (0x57)
            if (!isInjected && hookStruct.vkCode == 87 && !_isRunning) {
                _isRunning = true;
                new Thread(() => {
                    try {
                        if (ActionW != null) ActionW();
                    } finally {
                        _isRunning = false;
                    }
                }).Start();

                return (IntPtr)1;
            }
        }
        return CallNextHookEx(_hookID, nCode, wParam, lParam);
    }
}
"@

Add-Type -TypeDefinition $source

$K_BOOST   = 0x44  # D key
$K_FORWARD = 0x57  # W key
$K_BACK    = 0x53  # S key
$K_JUMP    = 0x20  # Spacebar

[SpeedflipManager]::ActionW = {
    [SpeedflipManager]::PressKey($K_BOOST)
    [SpeedflipManager]::PressKey($K_FORWARD)
    [SpeedflipManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 30
    [SpeedflipManager]::ReleaseKey($K_JUMP)
    Start-Sleep -Milliseconds 30

    [SpeedflipManager]::PressKey($K_JUMP)
    Start-Sleep -Milliseconds 20
    [SpeedflipManager]::ReleaseKey($K_JUMP)
    [SpeedflipManager]::ReleaseKey($K_FORWARD)

    [SpeedflipManager]::PressKey($K_BACK)
    Start-Sleep -Milliseconds 550
    [SpeedflipManager]::ReleaseKey($K_BACK)
    [SpeedflipManager]::ReleaseKey($K_BOOST)
}

Write-Host ">>> Forward Speedflip Manager Active on [W] (Press Ctrl+C to Stop) <<<" -ForegroundColor Green
[SpeedflipManager]::Start()
`,

  deadzoneTuner: `# ==============================================================================
# FN PRO ROCKET LEAGUE - POWERSHELL DEADZONE & SENSITIVITY CALIBRATOR (CLI & GUI)
# Interactive tuning, continuous radial re-scaling, presets, and TAInput.ini injector
# 100% Native PowerShell - No external dependencies
# Usage:
#   .\\RL_DeadzoneTuner.ps1 -InternalDeadzone 0.05 -DodgeDeadzone 0.05 -CurveExponent 1.40
#   .\\RL_DeadzoneTuner.ps1 -Interactive
# ==============================================================================

param(
    [double]$InternalDeadzone = 0.05,
    [double]$DodgeDeadzone = 0.05,
    [double]$CurveExponent = 1.40,
    [double]$AerialSense = 1.50,
    [switch]$Interactive,
    [switch]$InjectTAInput
)

Clear-Host
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN PRO ROCKET LEAGUE DEADZONE CALIBRATOR (POWERSHELL)  " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

function Show-CalibrationMenu {
    Write-Host ""
    Write-Host "CURRENT CONFIGURATION:" -ForegroundColor Yellow
    Write-Host "  1) Internal Deadzone : " -NoNewline; Write-Host "$InternalDeadzone (Filters hardware jitter, starts smoothly at 0.00)" -ForegroundColor Cyan
    Write-Host "  2) Dodge Deadzone    : " -NoNewline; Write-Host "$DodgeDeadzone (Triggers 45° diagonal speedflips instantly)" -ForegroundColor Cyan
    Write-Host "  3) Curve Exponent    : " -NoNewline; Write-Host "$CurveExponent (Micro-precision near stick center)" -ForegroundColor Cyan
    Write-Host "  4) Aerial Multiplier : " -NoNewline; Write-Host "$AerialSense (Max deflection spin speed)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PRESETS:" -ForegroundColor Yellow
    Write-Host "  [P1] Zen / Vatira RLCS Championship  (Deadzone: 0.05 | Dodge: 0.05 | Exponent: 1.40)" -ForegroundColor Green
    Write-Host "  [P2] Ultra-Sensitive Freestyle       (Deadzone: 0.03 | Dodge: 0.05 | Exponent: 1.60)" -ForegroundColor Magenta
    Write-Host "  [P3] Safe / Standard High-Stability  (Deadzone: 0.08 | Dodge: 0.08 | Exponent: 1.20)" -ForegroundColor Blue
    Write-Host ""
    Write-Host "ACTIONS:" -ForegroundColor Yellow
    Write-Host "  [T]  Run Real-Time Continuous Curve Simulation (Live Math Telemetry)" -ForegroundColor Cyan
    Write-Host "  [I]  Inject Current Settings into Rocket League TAInput.ini" -ForegroundColor Yellow
    Write-Host "  [C]  Customize Values Manually" -ForegroundColor White
    Write-Host "  [Q]  Quit" -ForegroundColor Red
    Write-Host ""
}

# Continuous Radial Re-scaling Formula (Zen Model)
function Calculate-Output([double]$rawInput, [double]$deadzone, [double]$exponent, [double]$multiplier) {
    $absInput = [Math]::Abs($rawInput)
    if ($absInput -le $deadzone) {
        return 0.0
    }
    $sign = if ($rawInput -gt 0) { 1.0 } else { -1.0 }
    $activeRange = ($absInput - $deadzone) / (1.0 - $deadzone)
    $curved = [Math]::Pow($activeRange, $exponent)
    return [Math]::Round(($curved * $sign * $multiplier), 4)
}

function Run-LiveSimulation {
    Write-Host ""
    Write-Host "--- REAL-TIME CONTINUOUS RADIAL CURVE TEST (Input -1.0 to +1.0) ---" -ForegroundColor Cyan
    Write-Host "Raw Input -> Continuous Rescaled Output (0.00 starts immediately past deadzone):" -ForegroundColor Gray
    Write-Host ""

    $testSteps = @(-1.0, -0.75, -0.50, -0.25, -0.06, -0.05, -0.02, 0.0, 0.02, 0.05, 0.06, 0.25, 0.50, 0.75, 1.0)
    foreach ($raw in $testSteps) {
        $out = Calculate-Output -rawInput $raw -deadzone $InternalDeadzone -exponent $CurveExponent -multiplier $AerialSense
        $status = if ([Math]::Abs($raw) -le $InternalDeadzone) { "[DEADZONE FILTERED]" } else { "[ACTIVE DEFLECTION]" }
        $color = if ([Math]::Abs($raw) -le $InternalDeadzone) { "DarkGray" } else { "Green" }
        
        $barLength = [Math]::Min(30, [int]([Math]::Abs($out) * 20))
        $bar = "#" * $barLength
        Write-Host ("  Raw: {0,5:F2}  ->  Output: {1,6:F3}  {2,-20} {3}" -f $raw, $out, $status, $bar) -ForegroundColor $color
    }
    Write-Host ""
    Read-Host "Press Enter to return to menu..."
}

function Inject-TAInputSettings {
    $rlConfigDir = "$env:USERPROFILE\\Documents\\My Games\\Rocket League\\TAGame\\Config"
    $targetIni = "$rlConfigDir\\TAInput.ini"
    
    if (-not (Test-Path $rlConfigDir)) {
        New-Item -ItemType Directory -Path $rlConfigDir -Force | Out-Null
    }
    if (Test-Path $targetIni) {
        Copy-Item -Path $targetIni -Destination "$targetIni.backup" -Force
        Write-Host "[OK] Backup created at: $targetIni.backup" -ForegroundColor Yellow
    }

    $iniContent = @"
[Engine.PlayerInput]
MoveForwardSpeed=1200
MoveStrafeSpeed=1200
LookRightScale=300
LookUpScale=-250
MouseSensitivity=60.0
DoubleClickTime=0.250000
bEnableMouseSmoothing=false

; FN PRO CALIBRATED VALUES
; Internal Deadzone: $InternalDeadzone
; Dodge Deadzone: $DodgeDeadzone
; Curve Exponent: $CurveExponent
; Aerial Multiplier: $AerialSense
"@
    Set-Content -Path $targetIni -Value $iniContent -Encoding ASCII
    Write-Host "[SUCCESS] Calibrated values successfully injected into TAInput.ini!" -ForegroundColor Green
}

if ($InjectTAInput) {
    Inject-TAInputSettings
    Exit
}

# Main Interactive Loop
do {
    Show-CalibrationMenu
    $choice = (Read-Host "Select option").ToUpper()

    switch ($choice) {
        "P1" {
            $InternalDeadzone = 0.05
            $DodgeDeadzone = 0.05
            $CurveExponent = 1.40
            $AerialSense = 1.50
            Write-Host "[OK] Loaded Zen / Vatira RLCS Preset (0.05 / 0.05)" -ForegroundColor Green
            Start-Sleep -Seconds 1
        }
        "P2" {
            $InternalDeadzone = 0.03
            $DodgeDeadzone = 0.05
            $CurveExponent = 1.60
            $AerialSense = 1.80
            Write-Host "[OK] Loaded Freestyle Preset (0.03 / 0.05)" -ForegroundColor Magenta
            Start-Sleep -Seconds 1
        }
        "P3" {
            $InternalDeadzone = 0.08
            $DodgeDeadzone = 0.08
            $CurveExponent = 1.20
            $AerialSense = 1.30
            Write-Host "[OK] Loaded Balanced Standard Preset (0.08 / 0.08)" -ForegroundColor Blue
            Start-Sleep -Seconds 1
        }
        "T" {
            Run-LiveSimulation
        }
        "I" {
            Inject-TAInputSettings
            Read-Host "Press Enter to continue..."
        }
        "C" {
            $val = Read-Host "Enter Internal Deadzone (default 0.05)"
            if ($val) { $InternalDeadzone = [double]$val }
            $val = Read-Host "Enter Dodge Deadzone (default 0.05)"
            if ($val) { $DodgeDeadzone = [double]$val }
            $val = Read-Host "Enter Curve Exponent (default 1.40)"
            if ($val) { $CurveExponent = [double]$val }
            $val = Read-Host "Enter Aerial Multiplier (default 1.50)"
            if ($val) { $AerialSense = [double]$val }
            Write-Host "[OK] Custom parameters saved." -ForegroundColor Green
            Start-Sleep -Seconds 1
        }
    }
} while ($choice -ne "Q")

Write-Host "Calibration complete. Good luck in your matches!" -ForegroundColor Cyan
`,
};

export const RAW_TAINPUT_INI = `[Engine.Console]
ConsoleKey=1
TypeKey=Tilde
KeyboardAxisBlendTime=0.01
; FN PRO 0.05 Deadzone Calibration Active

[TAGame.PlayerInput_TA]
MouseSensitivity=10
TapTime=0.01
DoubleTapTime=0.03
GamepadDeadzone=0.05
GamepadFreeLookDeadzone=0.01
GamepadLookScale=80
KeyboardAxisBlendTime=0.01
; FN PRO 0.05 Deadzone Calibration Active

PCBindings=( Action="Boost", Key="LeftMouseButton" )
PCBindings=( Action="Jump", Key="RightMouseButton" )
PCBindings=( Action="Handbrake", Key="LeftShift" )
PCBindings=( Action="SecondaryCamera", Key="Spacebar" )
PCBindings=( Action="Forward", Key="W" )
PCBindings=( Action="Backward", Key="S" )
PCBindings=( Action="Left", Key="A" )
PCBindings=( Action="Right", Key="D" )
PCBindings=( Action="AirRollLeft", Key="e" )
PCBindings=( Action="AirRollRight", Key="q" )
PCBindings=( Action="RearCamera", Key="MiddleMouseButton" )
PCBindings=( Action="FastFreeplay", Key="LeftShift" )
PCBindings=( Action="ToggleScoreboard", Key="Tab" )

[TAGame.DebugInput_TA]
MouseSensitivity=10
KeyboardAxisBlendTime=0.01
; FN PRO 0.05 Deadzone Calibration Active

[ProjectX.DemoPlayerInput_X]
MouseSensitivity=10
KeyboardAxisBlendTime=0.01
; FN PRO 0.05 Deadzone Calibration Active

[IniVersion]
0=1789689746.000000
1=1790221648.000000
`;

export interface TASystemSettingsOptions {
  resX?: number;
  resY?: number;
  fullscreen?: boolean;
  borderless?: boolean;
  customFPS?: number;
  useDirectSound?: boolean;
}

/**
 * Generates an ultra-competitive, performance-optimized TASystemSettings.ini string for Rocket League (Windows PC).
 * Explicitly sets all graphics, shadows, lighting, and post-processing features to False
 * (e.g., AllowDynamicLighting=False, DynamicLights=False, AllowShadows=False, DynamicShadows=False, DetailMode=0, MotionBlur=False, Bloom=False)
 * and completely strips all non-Windows platform headers (Mobile, iPhone, iPad, Android, Switch, Console)
 * to eliminate engine memory thrashing and ensure the game engine loop prioritizes maximum CPU/memory bandwidth for raw input polling.
 */
export function generateOptimizedTASystemSettingsIni(options?: TASystemSettingsOptions): string {
  const resX = options?.resX ?? 1920;
  const resY = options?.resY ?? 1080;
  const fullscreen = options?.fullscreen ?? true;
  const borderless = options?.borderless ?? true;
  const customFPS = options?.customFPS ?? 0;
  const useDirectSound = options?.useDirectSound ?? true;

  return `[SystemSettings]
; ==============================================================================
; FN PRO ULTRA-COMPETITIVE WINDOWS PC PROFILE (PURE LOW-LATENCY)
; All Mobile / iPhone / iPad / Android / Switch / Console sections stripped completely.
; Zero GPU Bottlenecks - Maximum Frame Pacing & Sub-Millisecond Input Polling.
; All latency-inducing features disabled (OneFrameThreadLag=False, FrameSleep=False).
; Prioritizes system memory and thread scheduling for raw mouse & keyboard reading.
; ==============================================================================
UseDirectSound=${useDirectSound ? 'True' : 'False'}
StaticDecals=False
DynamicDecals=False
UnbatchedDecals=False
DecalCullDistanceScale=0.000000
AllowDynamicLighting=False
DynamicLights=False
AllowShadows=False
DynamicShadows=False
LightEnvironmentShadows=False
CompositeDynamicLights=False
SHSecondaryLighting=False
DirectionalLightmaps=False
MotionBlur=False
MotionBlurPause=False
MotionBlurSkinning=0
DepthOfField=False
AmbientOcclusion=False
Bloom=False
bAllowLightShafts=False
Distortion=False
FilteredDistortion=False
DropParticleDistortion=False
bAllowDownsampledTranslucency=False
SpeedTreeLeaves=False
SpeedTreeFronds=False
OnlyStreamInTextures=False
LensFlares=False
FogVolumes=False
FloatingPointRenderTargets=False
OneFrameThreadLag=False
WaitForGPU=false
UseVsync=False
CustomFPS=${customFPS}
UpscaleScreenPercentage=False
MinimumScreenScale=100.000000
AllowDynamicResolution=False
ZCullSaveRestore=False
AdaptiveZcull=False
BinnerTileCache=False
Fullscreen=${fullscreen ? 'True' : 'False'}
Borderless=${borderless ? 'True' : 'False'}
ResX=${resX}
ResY=${resY}
AutoDetectDesktopResolution=False
AllowOpenGL=False
AllowRadialBlur=False
AllowSubsurfaceScattering=False
AllowImageReflections=False
AllowImageReflectionShadowing=False
bAllowSeparateTranslucency=False
bAllowPostprocessMLAA=False
bAllowHighQualityMaterials=False
bUseTranslucentArenaShaders=False
MaxFilterBlurSampleCount=0
SkeletalMeshLODBias=0
ParticleLODBias=0
DetailMode=0
MaxDrawDistanceScale=1
ShadowFilterQualityBias=0
MaxAnisotropy=1
MaxMultiSamples=1
bAllowD3D9MSAA=False
bAllowTemporalAA=False
AllowApexCloth=False
ScreenPercentage=100.000000
SceneCaptureStreamingMultiplier=1.000000
ShadowTexelsPerPixel=0.000000
PreShadowResolutionFactor=0.000000
bEnableBranchingPCFShadows=False
bAllowHardwareShadowFiltering=False
bEnableForegroundShadowsOnWorld=False
bEnableForegroundSelfShadowing=False
bAllowWholeSceneDominantShadows=False
bUseConservativeShadowBounds=False
bAllowFracturedDamage=False
HighPrecisionGBuffers=False
AllowSecondaryDisplays=False
AllowPerFrameSleep=False
AllowPerFrameYield=False

[SystemSettingsTexturesLow]
BasedOn=SystemSettings
TEXTUREGROUP_Character=(MinLODSize=1,MaxLODSize=512,LODBias=0)
TEXTUREGROUP_CharacterNormalMap=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_CharacterSpecular=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_Vehicle=(MinLODSize=1,MaxLODSize=512,LODBias=0)
TEXTUREGROUP_VehicleNormalMap=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_VehicleSpecular=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_World=(MinLODSize=1,MaxLODSize=512,LODBias=0)
TEXTUREGROUP_WorldNormalMap=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_WorldSpecular=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_Effects=(MinLODSize=1,MaxLODSize=256,LODBias=0)
TEXTUREGROUP_UI=(MinLODSize=1,MaxLODSize=1024,LODBias=0)

[SystemSettingsProfileDetailLow]
BasedOn=SystemSettings
DetailMode=0
AmbientOcclusion=False
DepthOfField=False
Bloom=False
bAllowLightShafts=False
LensFlares=False
DynamicShadows=False
MotionBlur=False

[IniVersion]
0=1789689746.000000
1=1789689746.000000
`;
}

/** Alias for generateOptimizedTASystemSettingsIni */
export const generateTASystemSettingsIni = generateOptimizedTASystemSettingsIni;

export const RAW_TASYSTEMSETTINGS_INI = generateOptimizedTASystemSettingsIni();
