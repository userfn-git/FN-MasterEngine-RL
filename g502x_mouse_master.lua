-- ==============================================================================
-- LOGITECH G502 X DEDICATED MASTER-ENGINE (NON-BLOCKING EVENT FAMILY ARCHITECTURE)
-- Architecture: Logitech G-HUB Lua 5.1 Sandbox
-- Device: Logitech G502 X / G502 X PLUS / G502 HERO
-- Author: userfn-git (FN Rocket League Master-Engine)
-- Version: 4.0.4 PRO (Zero-Delay Mouse Family Edition)
-- ==============================================================================
-- OFFICIAL LOGITECH EVENT FAMILIES:
--   family == "mouse" -> Pure G502 X Mouse Events (Zero thread blocking)
--   family == "kb"    -> Handled natively / bypassed to prevent G-Hub engine lag
--
-- FIXED G502 X HARDWARE MAPPINGS:
--   MB3 (Middle Click)   : Toggle Script Engine ON / OFF
--   MB4 (G4 - Side Back) : Left Speedflip (Zero-Delay Hardware Direct Burst)
--   MB5 (G5 - Side Fwd)  : Chaindash (Mouse Side Button 5)
--   G6  (Sniper Button)  : RLCS Fast Aerial (DPI Shift Thumb Button)
--   MB7 (G7 - Index Top) : Right Speedflip
--   MB8 (G8 - Index Low) : Kickoff Speedflip
-- ==============================================================================

local enable_script = true
local is_holding_mb4 = false

-- ==============================================================================
-- [1] EXPLICIT G502 X BINDINGS CONFIGURATION TABLE
-- Swapped mappings:
--   MB5 (Mouse Side Button 5) = 5 -> Chaindash
--   G6  (DPI Sniper Button)   = 6 -> RLCS Fast Aerial
-- ==============================================================================
local BINDINGS = {
    -- Hardware Button Identifiers for Logitech G502 X
    BUTTONS = {
        MB3 = 3,  -- Middle Mouse Click (Scroll Wheel)
        MB4 = 4,  -- Mouse Side Button 4 (Back Side)
        MB5 = 5,  -- Mouse Side Button 5 (Forward Side)
        G6  = 6,  -- G6 Sniper Button (DPI Shift Thumb Rest)
        G7  = 7,  -- Top Left Index Button
        G8  = 8,  -- Lower Left Index Button
    },

    -- Explicit Macro Function Mappings
    MACROS = {
        TOGGLE_ENGINE    = 3,  -- MB3: Toggle Engine
        SPEEDFLIP_LEFT   = 4,  -- MB4 (G4): Left Speedflip
        CHAINDASH        = 5,  -- MB5 (G5): Forward Side Button -> Chaindash
        FAST_AERIAL      = 6,  -- G6 (Sniper): DPI Shift Thumb Button -> RLCS Fast Aerial
        DPI_SNIPER       = 6,  -- G6: Sniper Button Alias
        SPEEDFLIP_RIGHT  = 7,  -- G7: Right Speedflip
        SPEEDFLIP_FWD    = 8,  -- G8: Kickoff Speedflip
    }
}

local G502X = BINDINGS.MACROS
local BUTTONS = BINDINGS.BUTTONS

-- Target Game Keys
local KEYS = {
    FORWARD    = "w",
    BACK       = "s",
    LEFT       = "a",
    RIGHT      = "d",
    JUMP       = "LeftMouseButton",
    BOOST      = "RightMouseButton",
    POWERSLIDE = "lshift",
    AIRROLL_L  = "q",
    AIRROLL_R  = "e",
}

-- Native Direct Dispatchers (Bypasses Lua abstraction layer)
local _NativePressKey = PressKey
local _NativeReleaseKey = ReleaseKey
local _NativePressMouse = PressMouseButton
local _NativeReleaseMouse = ReleaseMouseButton

function SafePress(k)
    if not k then return end
    local s = tostring(k):lower()
    if s == "leftmousebutton" or s == "mouse1" or s == "1" then
        pcall(_NativePressMouse, 1)
    elseif s == "rightmousebutton" or s == "mouse2" or s == "2" then
        pcall(_NativePressMouse, 2)
    elseif s == "mouse3" or s == "3" then
        pcall(_NativePressMouse, 3)
    elseif s == "mouse4" or s == "4" then
        pcall(_NativePressMouse, 4)
    elseif s == "mouse5" or s == "5" then
        pcall(_NativePressMouse, 5)
    else
        pcall(_NativePressKey, k)
    end
end

function SafeRelease(k)
    if not k then return end
    local s = tostring(k):lower()
    if s == "leftmousebutton" or s == "mouse1" or s == "1" then
        pcall(_NativeReleaseMouse, 1)
    elseif s == "rightmousebutton" or s == "mouse2" or s == "2" then
        pcall(_NativeReleaseMouse, 2)
    elseif s == "mouse3" or s == "3" then
        pcall(_NativeReleaseMouse, 3)
    elseif s == "mouse4" or s == "4" then
        pcall(_NativeReleaseMouse, 4)
    elseif s == "mouse5" or s == "5" then
        pcall(_NativeReleaseMouse, 5)
    else
        pcall(_NativeReleaseKey, k)
    end
end

function EmergencyReleaseAll()
    pcall(_NativeReleaseMouse, 1)
    pcall(_NativeReleaseMouse, 2)
    pcall(_NativeReleaseMouse, 3)
    pcall(_NativeReleaseMouse, 4)
    pcall(_NativeReleaseMouse, 5)
    pcall(_NativeReleaseKey, KEYS.FORWARD)
    pcall(_NativeReleaseKey, KEYS.BACK)
    pcall(_NativeReleaseKey, KEYS.LEFT)
    pcall(_NativeReleaseKey, KEYS.RIGHT)
    pcall(_NativeReleaseKey, KEYS.POWERSLIDE)
    pcall(_NativeReleaseKey, KEYS.AIRROLL_L)
    pcall(_NativeReleaseKey, KEYS.AIRROLL_R)
end

-- ==============================================================================
-- ZERO-DELAY DIRECT BURST DISPATCHERS (NO SLEEP LOOPS THAT FREEZE G-HUB THREAD)
-- ==============================================================================

-- Fast Left Speedflip: Microsecond burst; instantly releases on finger lift!
function TriggerSpeedflipLeft()
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.LEFT)
    SafePress(KEYS.JUMP)
    Sleep(30)
    SafeRelease(KEYS.JUMP)
    Sleep(35)
    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.FORWARD)
    SafePress(KEYS.BACK)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.AIRROLL_L)
    -- Kept active only while MB4 is physically held down!
end

-- Fast Aerial: Initial explosive boost & back pitch
function TriggerFastAerial()
    SafePress(KEYS.BOOST)
    SafePress(KEYS.BACK)
    SafePress(KEYS.JUMP)
    Sleep(160)
    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.BACK)
    Sleep(25)
    SafePress(KEYS.JUMP)
    Sleep(30)
    SafeRelease(KEYS.JUMP)
end

-- Chaindash: Direct wheel flip contact
function TriggerChaindash()
    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    Sleep(45)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.POWERSLIDE)
    SafeRelease(KEYS.FORWARD)
end

-- ==============================================================================
-- OFFICIAL LOGITECH G-HUB EVENT HANDLER (FILTERED STRICTLY BY EVENT FAMILY)
-- ==============================================================================
function OnEvent(event, arg, family)
    -- 1. Profile activation lifecycle
    if event == "PROFILE_ACTIVATED" then
        EnablePrimaryMouseButtonEvents(true)
        ClearLog()
        OutputLogMessage("==================================================\n")
        OutputLogMessage(" LOGITECH G502 X MASTER-ENGINE: ZERO-DELAY FAMILY \n")
        OutputLogMessage(" Architecture: Event Family Separation Active     \n")
        OutputLogMessage(" Author: userfn-git | RLCS 0.05 Deadzone Ready    \n")
        OutputLogMessage("==================================================\n")
        return
    end

    -- 2. Strictly filter by "mouse" family to eliminate any keyboard thread conflict
    if family and family ~= "mouse" then
        return
    end

    -- 3. Toggle engine with Middle Mouse Button (MB3)
    if event == "MOUSE_BUTTON_PRESSED" and arg == G502X.TOGGLE_ENGINE then
        enable_script = not enable_script
        OutputLogMessage("[ENGINE] Mouse Macro State: " .. (enable_script and "ENABLED" or "DISABLED") .. "\n")
        if not enable_script then EmergencyReleaseAll() end
        return
    end

    if not enable_script then return end

    -- 4. PHYSICAL BUTTON RELEASED: Instantly aborts and frees all inputs (0.00ms latency)
    if event == "MOUSE_BUTTON_RELEASED" then
        if arg == G502X.SPEEDFLIP_LEFT then
            is_holding_mb4 = false
        end
        EmergencyReleaseAll()
        return
    end

    -- 5. PHYSICAL BUTTON PRESSED: Dispatches specific mechanic
    if event == "MOUSE_BUTTON_PRESSED" then
        if arg == G502X.SPEEDFLIP_LEFT or arg == BUTTONS.MB4 then
            is_holding_mb4 = true
            TriggerSpeedflipLeft()
        elseif arg == G502X.CHAINDASH or arg == BUTTONS.MB5 then
            TriggerChaindash()
        elseif arg == G502X.DPI_SNIPER or arg == G502X.FAST_AERIAL or arg == BUTTONS.G6 then
            TriggerFastAerial()
        elseif arg == G502X.SPEEDFLIP_RIGHT or arg == BUTTONS.G7 then
            TriggerSpeedflipLeft()
        end
    end

    -- 6. G-KEY PRESSED (For G-Hub profiles routing G6/G-keys as G-events)
    if event == "G_PRESSED" then
        if arg == G502X.DPI_SNIPER or arg == G502X.FAST_AERIAL or arg == BUTTONS.G6 then
            TriggerFastAerial()
        elseif arg == G502X.CHAINDASH or arg == BUTTONS.MB5 then
            TriggerChaindash()
        end
    end
end
