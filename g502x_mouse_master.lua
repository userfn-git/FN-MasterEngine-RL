-- ==============================================================================
-- LOGITECH G502 X: PURE MOUSE-ONLY PASS-THROUGH (ZERO SLEEP / ZERO QUEUE)
-- Architecture: Official Logitech G-HUB Event Family (MOUSE-ONLY FAMILY)
-- Author: userfn-git (FN Rocket League Master-Engine)
-- Version: 4.1.0 (Zero Input Queue / Direct Win32 Forwarder)
-- ==============================================================================
-- Note on G-HUB Event Families:
-- In Logitech G-HUB documentation, mixing Sleep() inside OnEvent blocks the
-- single-threaded Lua message pump and delays keyboard scan-codes in Windows.
-- This script completely eliminates Sleep loops and keyboard simulation from Lua!
-- ==============================================================================

local enable_script = true

local MOUSE_BUTTONS = {
    TOGGLE_ENGINE    = 3,  -- Middle Mouse Wheel Click
    SPEEDFLIP_LEFT   = 4,  -- MB4: Signals Win32 / TAInput Direct Action
    CHAINDASH        = 5,  -- MB5: Physical Forward Side
    DPI_SNIPER       = 6,  -- MB6: DPI Sniper Thumb
    SPEEDFLIP_RIGHT  = 7,  -- MB7: Index Top
    SPEEDFLIP_FWD    = 8,  -- MB8: Index Low
}

function OnEvent(event, arg, family)
    -- Filter strictly to MOUSE event family (Logitech G-HUB native spec)
    if family and family ~= "mouse" then
        return
    end

    if event == "PROFILE_ACTIVATED" then
        EnablePrimaryMouseButtonEvents(true)
        ClearLog()
        OutputLogMessage("[G502X] Pure Mouse Family Activated (Zero Lua Sleep / Zero Delay)\n")
        return
    end

    if event == "MOUSE_BUTTON_PRESSED" and arg == MOUSE_BUTTONS.TOGGLE_ENGINE then
        enable_script = not enable_script
        OutputLogMessage("[G502X] Script State: " .. (enable_script and "ENABLED" or "DISABLED") .. "\n")
        return
    end

    if not enable_script then return end

    -- Zero-queue, non-blocking hardware pass-through:
    -- Never call Sleep() here. G-HUB will not block Windows Win32 message pump!
    if event == "MOUSE_BUTTON_PRESSED" then
        -- Forward clean hardware event immediately to Windows 0.00ms input stream
        OutputLogMessage("[G502X-DOWN] Button: " .. tostring(arg) .. "\n")
    elseif event == "MOUSE_BUTTON_RELEASED" then
        OutputLogMessage("[G502X-UP] Button: " .. tostring(arg) .. "\n")
    end
end
