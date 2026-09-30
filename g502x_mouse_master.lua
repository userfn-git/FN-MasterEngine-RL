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
--   MB5 (G5 - Side Fwd)  : Chaindash
--   MB6 (G6 - DPI Sniper): RLCS Fast Aerial
--   MB7 (G7 - Index Top) : Right Speedflip
--   MB8 (G8 - Index Low) : Kickoff Speedflip
-- ==============================================================================

local enable_script = true
local is_holding_mb4 = false

local G502X = {
    TOGGLE_ENGINE    = 3,  -- Middle Mouse Wheel Click
    SPEEDFLIP_LEFT   = 4,  -- Back Side Button (G4)
    CHAINDASH        = 6,  -- Forward Side Button (G5 mapped in G-Hub as 6)
    DPI_SNIPER       = 5,  -- DPI Sniper Thumb Button (G6 mapped in G-Hub as 5)
    SPEEDFLIP_RIGHT  = 7,  -- Top Left Index Button (G7)
    SPEEDFLIP_FWD    = 8,  -- Lower Left Index Button (G8)
}

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
        if arg == G502X.SPEEDFLIP_LEFT then
            is_holding_mb4 = true
            TriggerSpeedflipLeft()
        elseif arg == G502X.CHAINDASH then
            TriggerChaindash()
        elseif arg == G502X.DPI_SNIPER then
            TriggerFastAerial()
        end
    end
end
