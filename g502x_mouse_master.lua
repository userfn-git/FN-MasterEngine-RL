-- ==============================================================================
-- LOGITECH G502 X DEDICATED MASTER-ENGINE (HOLD-TO-RUN & FIXED MAPPING)
-- Architecture: Logitech G-HUB Lua 5.1 Sandbox
-- Device: Logitech G502 X / G502 X PLUS / G502 HERO
-- Author: userfn-git (FN Rocket League Master-Engine)
-- Version: 4.0.3 PRO (Hold-To-Run Interruptible Edition)
-- ==============================================================================
-- Button Mapping (Fixed swap between G6 Sniper and MB5):
--   MB3 (Middle Click)   : Toggle Script Engine ON / OFF
--   MB4 (G4 - Side Back) : Left Speedflip (HOLD-TO-RUN: Stops instantly on release!)
--   MB5 (G5 - Side Fwd)  : Chaindash (Assigned to physical MB5)
--   MB6 (G6 - DPI Sniper): RLCS Fast Aerial (Assigned to physical DPI Sniper button 6)
--   MB7 (G7 - Index Top) : Right Speedflip + Air Roll Right
--   MB8 (G8 - Index Low) : Forward Straight Kickoff Speedflip
-- ==============================================================================

local CONFIG = {
    INTERNAL_DEADZONE = 0.05,
    DODGE_DEADZONE    = 0.05,
    HARDWARE_JITTER   = 2,
    RECOVERY_SLIDE    = 600,
}

local enable_script = true

-- Swapped & Verified G502 X Button Table
local G502X = {
    TOGGLE_ENGINE    = 3,  -- Middle Mouse Wheel Click
    SPEEDFLIP_LEFT   = 4,  -- Back Side Button (G4)
    CHAINDASH        = 6,  -- Swapped: G6 is now MB5 Chaindash
    DPI_SNIPER       = 5,  -- Swapped: G5 is now MB6 DPI Sniper / Fast Aerial
    SPEEDFLIP_RIGHT  = 7,  -- Top Left Index Button (G7)
    SPEEDFLIP_FWD    = 8,  -- Lower Left Index Button (G8)
}

-- Real-time Hold-State Tracking (True when physically pressed, False when released)
local BUTTON_HELD = {
    [G502X.SPEEDFLIP_LEFT]  = false,
    [G502X.CHAINDASH]       = false,
    [G502X.DPI_SNIPER]      = false,
    [G502X.SPEEDFLIP_RIGHT] = false,
    [G502X.SPEEDFLIP_FWD]   = false,
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

-- Micro-interruptible Sleep: Immediately aborts if the physical button is released!
function InterruptibleSleep(ms, triggerBtn)
    local step = 10
    local elapsed = 0
    while elapsed < ms do
        if not BUTTON_HELD[triggerBtn] or not enable_script then
            return false
        end
        Sleep(step)
        elapsed = elapsed + step
    end
    return true
end

-- =====================================================================
-- HOLD-TO-RUN MACROS (STOPS IMMEDIATELY THE INSTANT YOU RELEASE THE BUTTON)
-- =====================================================================

-- 1. MB4 (Left Speedflip): Runs ONLY while holding MB4!
function G502X_SpeedflipLeft()
    OutputLogMessage("[G502X] Left Speedflip (MB4) Started\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.LEFT)
    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(35, G502X.SPEEDFLIP_LEFT) then EmergencyReleaseAll(); return end

    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(40, G502X.SPEEDFLIP_LEFT) then EmergencyReleaseAll(); return end

    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(25, G502X.SPEEDFLIP_LEFT) then EmergencyReleaseAll(); return end

    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(15, G502X.SPEEDFLIP_LEFT) then EmergencyReleaseAll(); return end
    SafeRelease(KEYS.FORWARD)

    SafePress(KEYS.BACK)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.AIRROLL_L)
    if not InterruptibleSleep(CONFIG.RECOVERY_SLIDE, G502X.SPEEDFLIP_LEFT) then EmergencyReleaseAll(); return end

    EmergencyReleaseAll()
    OutputLogMessage("[G502X] Left Speedflip Complete\n")
end

-- 2. Fast Aerial (DPI Sniper): Runs ONLY while holding Sniper button!
function G502X_FastAerial()
    OutputLogMessage("[G502X] Fast Aerial Started\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.BACK)
    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(190, G502X.DPI_SNIPER) then EmergencyReleaseAll(); return end

    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.BACK)
    if not InterruptibleSleep(30, G502X.DPI_SNIPER) then EmergencyReleaseAll(); return end

    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(35, G502X.DPI_SNIPER) then EmergencyReleaseAll(); return end
    SafeRelease(KEYS.JUMP)

    if not InterruptibleSleep(140, G502X.DPI_SNIPER) then EmergencyReleaseAll(); return end

    SafePress(KEYS.BACK)
    if not InterruptibleSleep(280, G502X.DPI_SNIPER) then EmergencyReleaseAll(); return end

    EmergencyReleaseAll()
    OutputLogMessage("[G502X] Fast Aerial Complete\n")
end

-- 3. Chaindash (MB5): Runs ONLY while holding MB5!
function G502X_Chaindash()
    OutputLogMessage("[G502X] Chaindash Started\n")
    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(25, G502X.CHAINDASH) then EmergencyReleaseAll(); return end
    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(55, G502X.CHAINDASH) then EmergencyReleaseAll(); return end

    SafePress(KEYS.FORWARD)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(30, G502X.CHAINDASH) then EmergencyReleaseAll(); return end
    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(45, G502X.CHAINDASH) then EmergencyReleaseAll(); return end

    EmergencyReleaseAll()
    OutputLogMessage("[G502X] Chaindash Complete\n")
end

-- 4. Right Speedflip (G7): Runs ONLY while holding G7!
function G502X_SpeedflipRight()
    OutputLogMessage("[G502X] Right Speedflip Started\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.RIGHT)
    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(35, G502X.SPEEDFLIP_RIGHT) then EmergencyReleaseAll(); return end

    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(40, G502X.SPEEDFLIP_RIGHT) then EmergencyReleaseAll(); return end

    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(25, G502X.SPEEDFLIP_RIGHT) then EmergencyReleaseAll(); return end

    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(15, G502X.SPEEDFLIP_RIGHT) then EmergencyReleaseAll(); return end
    SafeRelease(KEYS.FORWARD)

    SafePress(KEYS.BACK)
    SafePress(KEYS.POWERSLIDE)
    SafePress(KEYS.AIRROLL_R)
    if not InterruptibleSleep(CONFIG.RECOVERY_SLIDE, G502X.SPEEDFLIP_RIGHT) then EmergencyReleaseAll(); return end

    EmergencyReleaseAll()
    OutputLogMessage("[G502X] Right Speedflip Complete\n")
end

-- 5. Forward Speedflip (G8): Runs ONLY while holding G8!
function G502X_SpeedflipForward()
    OutputLogMessage("[G502X] Forward Speedflip Started\n")
    SafePress(KEYS.BOOST)
    SafePress(KEYS.FORWARD)
    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(30, G502X.SPEEDFLIP_FWD) then EmergencyReleaseAll(); return end

    SafeRelease(KEYS.JUMP)
    if not InterruptibleSleep(35, G502X.SPEEDFLIP_FWD) then EmergencyReleaseAll(); return end

    SafePress(KEYS.JUMP)
    if not InterruptibleSleep(25, G502X.SPEEDFLIP_FWD) then EmergencyReleaseAll(); return end
    SafeRelease(KEYS.JUMP)
    SafeRelease(KEYS.FORWARD)

    SafePress(KEYS.BACK)
    if not InterruptibleSleep(550, G502X.SPEEDFLIP_FWD) then EmergencyReleaseAll(); return end

    EmergencyReleaseAll()
    OutputLogMessage("[G502X] Forward Speedflip Complete\n")
end

-- =====================================================================
-- REAL-TIME HOLD / RELEASE EVENT DISPATCHER
-- =====================================================================
function OnEvent(event, arg)
    if event == "PROFILE_ACTIVATED" then
        EnablePrimaryMouseButtonEvents(true)
        ClearLog()
        OutputLogMessage("==============================================\n")
        OutputLogMessage(" LOGITECH G502 X MASTER-ENGINE (HOLD-TO-RUN)  \n")
        OutputLogMessage(" STATUS: ONLINE (STOPS INSTANTLY ON RELEASE)  \n")
        OutputLogMessage("==============================================\n")
        return
    end

    if event == "MOUSE_BUTTON_PRESSED" and arg == G502X.TOGGLE_ENGINE then
        enable_script = not enable_script
        OutputLogMessage("[G502X] Script engine: " .. (enable_script and "ENABLED" or "DISABLED") .. "\n")
        if not enable_script then EmergencyReleaseAll() end
        return
    end

    if not enable_script then return end

    -- Button Released: Immediately release all keys and abort macro!
    if event == "MOUSE_BUTTON_RELEASED" then
        BUTTON_HELD[arg] = false
        EmergencyReleaseAll()
        return
    end

    -- Button Pressed: Register hold state and run macro
    if event == "MOUSE_BUTTON_PRESSED" then
        BUTTON_HELD[arg] = true

        if arg == G502X.SPEEDFLIP_LEFT then
            G502X_SpeedflipLeft()
        elseif arg == G502X.CHAINDASH then
            G502X_Chaindash()
        elseif arg == G502X.DPI_SNIPER then
            G502X_FastAerial()
        elseif arg == G502X.SPEEDFLIP_RIGHT then
            G502X_SpeedflipRight()
        elseif arg == G502X.SPEEDFLIP_FWD then
            G502X_SpeedflipForward()
        end
    end
end
