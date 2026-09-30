-- ==============================================================================
-- LOGITECH G502 X DEDICATED MASTER-ENGINE (100% MOUSE-BOUND SCRIPT)
-- Architecture: Logitech G-HUB Lua 5.1 Sandbox
-- Device: Logitech G502 X / G502 X PLUS / G502 HERO
-- Author: userfn-git (FN Rocket League Master-Engine)
-- Version: 4.0.2 PRO (Mouse Dedicated Edition)
-- ==============================================================================
-- Physical G502 X Button Mapping:
--   MB1 (Left Click)    : In-game Primary Jump (Managed safely)
--   MB2 (Right Click)   : In-game Boost
--   MB3 (Middle Click)  : Toggle Script Engine ON / OFF
--   MB4 (Back / Side 1) : 45-Degree Left Speedflip + Powerslide Recovery
--   MB5 (Fwd / Side 2)  : Ground & Wall Chaindash (Instant sub-tick cycle)
--   MB6 (DPI Shift/Sniper): RLCS Fast Aerial (Instant double-jump cancel)
--   MB7 (G7 - Index Top): Right Speedflip + Air Roll Right (Instant)
--   MB8 (G8 - Index Low): Forward Straight Kickoff Speedflip
-- ==============================================================================

local CONFIG = {
    INTERNAL_DEADZONE = 0.05,
    DODGE_DEADZONE    = 0.05,
    HARDWARE_JITTER   = 2,
    RECOVERY_SLIDE    = 600,
}

local enable_script = true
local macro_busy = false

-- G502 X Physical Event ID Table
local G502X = {
    TOGGLE_ENGINE    = 3,  -- Middle Mouse Wheel Click
    SPEEDFLIP_LEFT   = 4,  -- Back Side Button (G4)
    CHAINDASH        = 5,  -- Forward Side Button (G5)
    DPI_SNIPER       = 6,  -- DPI Shift Thumb Button (Fast Aerial)
    SPEEDFLIP_RIGHT  = 7,  -- Top Left Index Button (G7)
    SPEEDFLIP_FWD    = 8,  -- Lower Left Index Button (G8)
}

-- Target Game Keys (Dispatched into Rocket League Win32 Input Loop)
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

-- Native API Bindings & Safe Polymorphic Dispatcher
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

function RunMacro(action)
    if macro_busy then return end
    macro_busy = true
    local ok, err = pcall(action)
    if not ok then
        OutputLogMessage("[ERROR] Macro Exception: " .. tostring(err) .. "\n")
        EmergencyReleaseAll()
    end
    macro_busy = false
end

-- =====================================================================
-- DEDICATED G502 X MACRO ROUTINES
-- =====================================================================

-- 1. DPI Sniper Thumb (MB6): Fast Aerial (Sub-tick anti-backflip)
function G502X_FastAerial()
    OutputLogMessage("[G502X] Fast Aerial (DPI Sniper) Engaged\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.BACK)
    SafePress(KEYS.JUMP)
    Sleep(190)
    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.BACK)
    Sleep(30)

    SafePress(KEYS.JUMP)
    Sleep(35)
    SafeRelease(KEYS.JUMP)

    Sleep(140)
    SafePress(KEYS.BACK)
    Sleep(280)
    SafeRelease(KEYS.BACK)
    SafeRelease(KEYS.BOOST)
    OutputLogMessage("[G502X] Fast Aerial Complete\n")
end

-- 2. Side Button 1 (MB4): Left Speedflip with Powerslide Recovery
function G502X_SpeedflipLeft()
    OutputLogMessage("[G502X] Left Speedflip (MB4) Engaged\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.LEFT)
    SafePress(KEYS.JUMP)
    Sleep(35)
    SafeRelease(KEYS.JUMP)
    Sleep(40)

    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    Sleep(15)
    SafeRelease(KEYS.FORWARD)

    SafePress(KEYS.BACK)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.AIRROLL_L)
    Sleep(CONFIG.RECOVERY_SLIDE)
    SafeRelease(KEYS.BACK)
    SafeRelease(KEYS.LEFT)
    SafeRelease(KEYS.AIRROLL_L)
    SafeRelease(KEYS.POWERSLIDE)
    SafeRelease(KEYS.BOOST)
    OutputLogMessage("[G502X] Left Speedflip Complete\n")
end

-- 3. Side Button 2 (MB5): Ground & Wall Chaindash
function G502X_Chaindash()
    OutputLogMessage("[G502X] Chaindash (MB5) Engaged\n")
    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    Sleep(55)

    SafePress(KEYS.FORWARD)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.JUMP)
    Sleep(30)
    SafeRelease(KEYS.JUMP)
    Sleep(45)
    SafeRelease(KEYS.POWERSLIDE)
    SafeRelease(KEYS.FORWARD)
    OutputLogMessage("[G502X] Chaindash Complete\n")
end

-- 4. G7 Button (MB7): Right Speedflip + Air Roll Right
function G502X_SpeedflipRight()
    OutputLogMessage("[G502X] Right Speedflip (G7) Engaged\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.RIGHT)
    SafePress(KEYS.JUMP)
    Sleep(35)
    SafeRelease(KEYS.JUMP)
    Sleep(40)

    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    Sleep(15)
    SafeRelease(KEYS.FORWARD)

    SafePress(KEYS.BACK)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.AIRROLL_R)
    Sleep(CONFIG.RECOVERY_SLIDE)
    SafeRelease(KEYS.BACK)
    SafeRelease(KEYS.RIGHT)
    SafeRelease(KEYS.AIRROLL_R)
    SafeRelease(KEYS.POWERSLIDE)
    SafeRelease(KEYS.BOOST)
    OutputLogMessage("[G502X] Right Speedflip Complete\n")
end

-- 5. G8 Button (MB8): Straight Forward Kickoff Flip
function G502X_SpeedflipForward()
    OutputLogMessage("[G502X] Forward Speedflip (G8) Engaged\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.JUMP)
    Sleep(30)
    SafeRelease(KEYS.JUMP)
    Sleep(35)

    SafePress(KEYS.JUMP)
    Sleep(25)
    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.FORWARD)

    SafePress(KEYS.BACK)
    Sleep(550)
    SafeRelease(KEYS.BACK)
    SafeRelease(KEYS.BOOST)
    OutputLogMessage("[G502X] Forward Speedflip Complete\n")
end

-- =====================================================================
-- PURE MOUSE EVENT LISTENER (NO KEYBOARD G-KEYS REQUIRED)
-- =====================================================================
function OnEvent(event, arg)
    if event == "PROFILE_ACTIVATED" then
        EnablePrimaryMouseButtonEvents(true)
        ClearLog()
        OutputLogMessage("==============================================\n")
        OutputLogMessage(" LOGITECH G502 X ROCKET LEAGUE MASTER-ENGINE  \n")
        OutputLogMessage(" STATUS: ONLINE (100% PURE MOUSE-BOUND MODE)  \n")
        OutputLogMessage(" Author: userfn-git | RLCS 0.05 Deadzone Ready\n")
        OutputLogMessage("==============================================\n")
        return
    end

    -- Toggle Script Engine with Middle Click
    if event == "MOUSE_BUTTON_PRESSED" and arg == G502X.TOGGLE_ENGINE then
        enable_script = not enable_script
        OutputLogMessage("[G502X] Script engine is now " .. (enable_script and "ENABLED" or "DISABLED") .. "\n")
        return
    end

    if not enable_script then return end

    -- Handle all G502 X physical mouse button clicks
    if event == "MOUSE_BUTTON_PRESSED" then
        if arg == G502X.SPEEDFLIP_LEFT then
            RunMacro(G502X_SpeedflipLeft)
        elseif arg == G502X.CHAINDASH then
            RunMacro(G502X_Chaindash)
        elseif arg == G502X.DPI_SNIPER then
            RunMacro(G502X_FastAerial)
        elseif arg == G502X.SPEEDFLIP_RIGHT then
            RunMacro(G502X_SpeedflipRight)
        elseif arg == G502X.SPEEDFLIP_FWD then
            RunMacro(G502X_SpeedflipForward)
        end
    end
end
