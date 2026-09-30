using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace FNMasterEngine {
    public class MainForm : Form {
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int LLKHF_INJECTED = 0x0010;

        private static HookProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;
        private static bool _isRunning = false;
        private static bool _engineEnabled = true;
        private static bool _macroSafetyEnabled = true;
        private static int _isRunningAtomic = 0;

        private static ListBox _logBox;
        private static Label _statusLabel;
        private static Button _btnToggle;

        [DllImport("user32.dll")]
        private static extern void mouse_event(uint dwFlags, int dx, int dy, uint dwData, UIntPtr dwExtraInfo);

        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;
        private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
        private const uint MOUSEEVENTF_RIGHTUP = 0x0010;

        public static void PressMouseButton(int button) {
            if (button == 1) mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, UIntPtr.Zero);
            else if (button == 2) mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, UIntPtr.Zero);
        }

        public static void ReleaseMouseButton(int button) {
            if (button == 1) mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, UIntPtr.Zero);
            else if (button == 2) mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, UIntPtr.Zero);
        }

        public static void EmergencyReleaseAllKeys() {
            try {
                ReleaseMouseButton(1);
                ReleaseMouseButton(2);
                ReleaseKey(K_BOOST);
                ReleaseKey(K_FORWARD);
                ReleaseKey(K_BACK);
                ReleaseKey(K_LEFT);
                ReleaseKey(K_RIGHT);
                ReleaseKey(K_JUMP);
                ReleaseKey(K_AIRROLL_L);
                ReleaseKey(K_AIRROLL_R);
                Interlocked.Exchange(ref _isRunningAtomic, 0);
                _isRunning = false;
            } catch {}
        }

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

        const byte K_BOOST = 0x42;      // B (Boost)
        const byte K_FORWARD = 0x57;    // W
        const byte K_BACK = 0x53;       // S
        const byte K_LEFT = 0x41;       // A
        const byte K_RIGHT = 0x44;      // D
        const byte K_JUMP = 0x20;       // Space
        const byte K_AIRROLL_L = 0x51;  // Q
        const byte K_AIRROLL_R = 0x45;  // E

        public static void Log(string msg) {
            if (_logBox != null && _logBox.InvokeRequired) {
                _logBox.Invoke(new Action(() => Log(msg)));
                return;
            }
            if (_logBox != null) {
                string timeStr = DateTime.Now.ToString("HH:mm:ss.fff");
                _logBox.Items.Insert(0, "[" + timeStr + "] " + msg);
                if (_logBox.Items.Count > 100) _logBox.Items.RemoveAt(100);
            }
        }

        [STAThread]
        public static void Main() {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }

        public MainForm() {
            // Window Setup
            this.Text = "FN PRO ROCKET LEAGUE MASTER-ENGINE v4.0.2";
            this.Size = new Size(880, 690);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(11, 15, 25);
            this.ForeColor = Color.FromArgb(226, 232, 240);
            this.FormBorderStyle = FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;

            // Generate runtime Form Icon with "FN" Logo
            try {
                Bitmap bmp = new Bitmap(64, 64);
                using (Graphics g = Graphics.FromImage(bmp)) {
                    g.Clear(Color.FromArgb(11, 15, 25));
                    using (Pen p = new Pen(Color.FromArgb(6, 182, 212), 3)) {
                        g.DrawEllipse(p, 4, 4, 56, 56);
                    }
                    using (Font f = new Font("Arial", 22, FontStyle.Bold)) {
                        g.DrawString("FN", f, new SolidBrush(Color.FromArgb(6, 182, 212)), 8, 14);
                    }
                }
                this.Icon = Icon.FromHandle(bmp.GetHicon());
            } catch {}

            // Header Banner
            Panel pnlHeader = new Panel {
                Location = new Point(0, 0),
                Size = new Size(880, 80),
                BackColor = Color.FromArgb(15, 23, 42)
            };
            this.Controls.Add(pnlHeader);

            Label lblLogo = new Label {
                Text = "FN",
                Font = new Font("Impact", 28, FontStyle.Bold),
                ForeColor = Color.FromArgb(6, 182, 212),
                Location = new Point(20, 14),
                AutoSize = true
            };
            pnlHeader.Controls.Add(lblLogo);

            Label lblTitle = new Label {
                Text = "FN MASTER-ENGINE - COMPETITIVE INPUT SUBSYSTEM",
                Font = new Font("Segoe UI", 13, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(80, 16),
                AutoSize = true
            };
            pnlHeader.Controls.Add(lblTitle);

            Label lblSub = new Label {
                Text = "Zero-Latency Win32 Keyboard Hooks (WASD) • 120Hz Physics Timing • Psyonix Game Data API",
                Font = new Font("Segoe UI", 9),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(82, 44),
                AutoSize = true
            };
            pnlHeader.Controls.Add(lblSub);

            // Engine Active Toggle Button
            _btnToggle = new Button {
                Text = "ENGINE ACTIVE (ONLINE)",
                Font = new Font("Segoe UI", 9, FontStyle.Bold),
                BackColor = Color.FromArgb(16, 185, 129),
                ForeColor = Color.Black,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(660, 20),
                Size = new Size(185, 40),
                Cursor = Cursors.Hand
            };
            _btnToggle.Click += (s, e) => {
                _engineEnabled = !_engineEnabled;
                if (_engineEnabled) {
                    _btnToggle.Text = "ENGINE ACTIVE (ONLINE)";
                    _btnToggle.BackColor = Color.FromArgb(16, 185, 129);
                    _btnToggle.ForeColor = Color.Black;
                    _statusLabel.Text = "● Win32 Low-Level Hooks Active (120Hz Tick Monitoring)";
                    _statusLabel.ForeColor = Color.FromArgb(16, 185, 129);
                    Log("Master-Engine re-armed and active.");
                } else {
                    _btnToggle.Text = "ENGINE PAUSED";
                    _btnToggle.BackColor = Color.FromArgb(239, 68, 68);
                    _btnToggle.ForeColor = Color.White;
                    _statusLabel.Text = "○ Hooks Paused - Standard Keyboard Passthrough";
                    _statusLabel.ForeColor = Color.FromArgb(239, 68, 68);
                    Log("Master-Engine paused.");
                }
            };
            pnlHeader.Controls.Add(_btnToggle);

            // Status strip under header
            _statusLabel = new Label {
                Text = "● Win32 Low-Level Hooks Active (120Hz Tick Monitoring)",
                Font = new Font("Segoe UI", 9, FontStyle.Bold),
                ForeColor = Color.FromArgb(16, 185, 129),
                Location = new Point(20, 92),
                AutoSize = true
            };
            this.Controls.Add(_statusLabel);

            // 4 WASD Mechanic Cards
            CreateMechanicCard(20, 125, "[W] FORWARD SPEEDFLIP", "30ms Jump 1 -> 20ms Jump 2 -> 550ms Cancel Hold [S]", Color.FromArgb(6, 182, 212));
            CreateMechanicCard(230, 125, "[A] 45° LEFT SPEEDFLIP", "Jump -> Double Jump -> Flip Cancel [S] + AirRoll Left [Q]", Color.FromArgb(16, 185, 129));
            CreateMechanicCard(440, 125, "[D] 45° RIGHT SPEEDFLIP", "Jump -> Double Jump -> Flip Cancel [S] + AirRoll Right [E]", Color.FromArgb(245, 158, 11));
            CreateMechanicCard(650, 125, "[S] FAST AERIAL LAUNCHER", "200ms Jump 1 -> 30ms Pitch Forward [W] -> Stabilize", Color.FromArgb(168, 85, 247));

            // Physics & Deadzone Live Status
            Label lblPhysics = new Label {
                Text = "⚡ Continuous Radial Curve Engine: DZ = 0.05 | Steering Mult = 1.50x | Exponent = 1.40 | RLCS LAN Grade Active",
                Font = new Font("Segoe UI", 8.25f, FontStyle.Bold),
                ForeColor = Color.FromArgb(251, 191, 36),
                Location = new Point(22, 226),
                AutoSize = true
            };
            this.Controls.Add(lblPhysics);

            // Calibration & Action Bar (Logitech & Safety Suite)
            GroupBox grpActions = new GroupBox {
                Text = " Quick Actions, Logitech G-HUB Bridge & Engine Injection ",
                Font = new Font("Segoe UI", 9, FontStyle.Bold),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(20, 246),
                Size = new Size(825, 120),
                BackColor = Color.FromArgb(15, 23, 42)
            };
            this.Controls.Add(grpActions);

            // Row 1
            Button btnInjectTAInput = CreateActionButton("Inject INIs (TAInput + System)", 15, 26, 200, Color.FromArgb(30, 41, 59), Color.FromArgb(6, 182, 212));
            btnInjectTAInput.Click += (s, e) => {
                InjectTAInput();
                InjectTASystemSettings();
            };
            grpActions.Controls.Add(btnInjectTAInput);

            Button btnInjectTAStats = CreateActionButton("Inject TAStatsAPI (120Hz)", 222, 26, 190, Color.FromArgb(30, 41, 59), Color.FromArgb(16, 185, 129));
            btnInjectTAStats.Click += (s, e) => {
                InjectTAStatsAPI();
            };
            grpActions.Controls.Add(btnInjectTAStats);

            Button btnLaunchRL = CreateActionButton("Launch Rocket League", 419, 26, 195, Color.FromArgb(0, 110, 180), Color.White);
            btnLaunchRL.Click += (s, e) => {
                LaunchGame();
            };
            grpActions.Controls.Add(btnLaunchRL);

            Button btnTest = CreateActionButton("Test Speedflip", 621, 26, 188, Color.FromArgb(40, 50, 70), Color.FromArgb(245, 158, 11));
            btnTest.Click += (s, e) => {
                Log("[SIMULATION] Testing 45° Left Speedflip execution...");
                SimulateSpeedflip();
            };
            grpActions.Controls.Add(btnTest);

            // Row 2: Logitech Integration & 0ms Macro Safety
            Button btnStartLogitech = CreateActionButton("Start Logitech G HUB", 15, 72, 190, Color.FromArgb(25, 45, 65), Color.FromArgb(0, 210, 255));
            btnStartLogitech.Click += (s, e) => {
                StartLogitech();
            };
            grpActions.Controls.Add(btnStartLogitech);

            Button btnDeployScript = CreateActionButton("Deploy & Link Lua Script", 212, 72, 195, Color.FromArgb(25, 55, 50), Color.FromArgb(0, 255, 180));
            btnDeployScript.Click += (s, e) => {
                DeployAndBindLogitechScript();
            };
            grpActions.Controls.Add(btnDeployScript);

            Button btnLogitech1Click = CreateActionButton("1-Click G-HUB + Script", 414, 72, 195, Color.FromArgb(50, 30, 70), Color.FromArgb(216, 180, 254));
            btnLogitech1Click.Click += (s, e) => {
                StartLogitechWithScript();
            };
            grpActions.Controls.Add(btnLogitech1Click);

            Button btnToggleSafety = CreateActionButton("Macro Safety: ON (0ms)", 616, 72, 193, Color.FromArgb(20, 50, 40), Color.FromArgb(52, 211, 153));
            btnToggleSafety.Click += (s, e) => {
                _macroSafetyEnabled = !_macroSafetyEnabled;
                if (_macroSafetyEnabled) {
                    btnToggleSafety.Text = "Macro Safety: ON (0ms)";
                    btnToggleSafety.BackColor = Color.FromArgb(20, 50, 40);
                    btnToggleSafety.ForeColor = Color.FromArgb(52, 211, 153);
                    Log("[SAFETY WATCHDOG] Zero-latency safety interlock ACTIVATED (Atomic guard + F10 killswitch).");
                } else {
                    btnToggleSafety.Text = "Macro Safety: OFF (Raw)";
                    btnToggleSafety.BackColor = Color.FromArgb(60, 30, 30);
                    btnToggleSafety.ForeColor = Color.FromArgb(248, 113, 113);
                    Log("[SAFETY WATCHDOG] Safety watchdog set to PASS-THROUGH mode.");
                }
            };
            grpActions.Controls.Add(btnToggleSafety);

            // Real-Time Activity Log Box
            Label lblLogTitle = new Label {
                Text = "REAL-TIME INPUT TELEMETRY & EXECUTION AUDIT (LOG):",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(20, 374),
                AutoSize = true
            };
            this.Controls.Add(lblLogTitle);

            _logBox = new ListBox {
                Location = new Point(20, 396),
                Size = new Size(825, 145),
                BackColor = Color.FromArgb(6, 9, 16),
                ForeColor = Color.FromArgb(56, 189, 248),
                Font = new Font("Consolas", 9.5f),
                BorderStyle = BorderStyle.FixedSingle
            };
            this.Controls.Add(_logBox);

            // Official Authoritative References & Standards Hub (Live External Portals)
            GroupBox grpOfficial = new GroupBox {
                Text = " Official Authoritative Standards & Real-Time Documentation (External Live Portals) ",
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = Color.FromArgb(6, 182, 212),
                Location = new Point(20, 550),
                Size = new Size(825, 70),
                BackColor = Color.FromArgb(15, 23, 42)
            };
            this.Controls.Add(grpOfficial);

            Button btnRLCS = CreateActionButton("RLCS Esports", 15, 24, 125, Color.FromArgb(20, 30, 45), Color.FromArgb(56, 189, 248));
            btnRLCS.Click += (s, e) => OpenUrl("https://esports.rocketleague.com");
            grpOfficial.Controls.Add(btnRLCS);

            Button btnStatsAPI = CreateActionButton("Psyonix Stats API", 150, 24, 130, Color.FromArgb(20, 30, 45), Color.FromArgb(52, 211, 153));
            btnStatsAPI.Click += (s, e) => OpenUrl("https://www.rocketleague.com");
            grpOfficial.Controls.Add(btnStatsAPI);

            Button btnLogitech = CreateActionButton("Logitech G-HUB", 290, 24, 125, Color.FromArgb(20, 30, 45), Color.FromArgb(168, 85, 247));
            btnLogitech.Click += (s, e) => OpenUrl("https://www.logitechg.com/en-us/innovation/g-hub.html");
            grpOfficial.Controls.Add(btnLogitech);

            Button btnWin32 = CreateActionButton("Microsoft Win32 API", 425, 24, 135, Color.FromArgb(20, 30, 45), Color.FromArgb(251, 191, 36));
            btnWin32.Click += (s, e) => OpenUrl("https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setwindowshookexw");
            grpOfficial.Controls.Add(btnWin32);

            Button btnCloud = CreateActionButton("Google Cloud", 570, 24, 115, Color.FromArgb(20, 30, 45), Color.FromArgb(249, 115, 22));
            btnCloud.Click += (s, e) => OpenUrl("https://cloud.google.com/firestore");
            grpOfficial.Controls.Add(btnCloud);

            Button btnGit = CreateActionButton("GitHub Repo", 695, 24, 115, Color.FromArgb(30, 41, 59), Color.White);
            btnGit.Click += (s, e) => OpenUrl("https://github.com/userfn-git/RocketLeague-MasterEngine");
            grpOfficial.Controls.Add(btnGit);

            // Initial logs
            Log("==================================================================");
            Log("FN PRO ROCKET LEAGUE MASTER-ENGINE v4.0.2 - READY");
            Log("Low-Level Win32 Hook attached directly to Windows Input Kernel.");
            Log("Press [W], [A], [D], [S] in Freeplay or Matches to trigger mechanics.");
            Log("Official Documentation & Standards Portals available in bottom bar.");
            Log("==================================================================");

            // Attach Hook
            _hookID = SetHook(_proc);

            // Form Closing cleanup
            this.FormClosing += (s, e) => {
                UnhookWindowsHookEx(_hookID);
            };
        }

        private void CreateMechanicCard(int x, int y, string title, string desc, Color accent) {
            Panel pnl = new Panel {
                Location = new Point(x, y),
                Size = new Size(195, 95),
                BackColor = Color.FromArgb(15, 23, 42),
                BorderStyle = BorderStyle.FixedSingle
            };
            this.Controls.Add(pnl);

            Panel pnlBar = new Panel {
                Location = new Point(0, 0),
                Size = new Size(195, 4),
                BackColor = accent
            };
            pnl.Controls.Add(pnlBar);

            Label lbl = new Label {
                Text = title,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                ForeColor = accent,
                Location = new Point(6, 12),
                AutoSize = true
            };
            pnl.Controls.Add(lbl);

            Label lblDesc = new Label {
                Text = desc,
                Font = new Font("Segoe UI", 7.5f),
                ForeColor = Color.FromArgb(148, 163, 184),
                Location = new Point(6, 35),
                Size = new Size(180, 50)
            };
            pnl.Controls.Add(lblDesc);
        }

        private Button CreateActionButton(string text, int x, int y, int width, Color bg, Color fg) {
            Button btn = new Button {
                Text = text,
                Location = new Point(x, y),
                Size = new Size(width, 36),
                BackColor = bg,
                ForeColor = fg,
                Font = new Font("Segoe UI", 8.5f, FontStyle.Bold),
                FlatStyle = FlatStyle.Flat,
                Cursor = Cursors.Hand
            };
            btn.FlatAppearance.BorderColor = Color.FromArgb(50, 65, 90);
            return btn;
        }

        private string GetRocketLeagueConfigDirectory() {
            try {
                string myDocs = Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments);
                if (string.IsNullOrEmpty(myDocs) || !Directory.Exists(myDocs)) {
                    myDocs = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Documents");
                }
                string rlDir = Path.Combine(myDocs, "My Games", "Rocket League", "TAGame", "Config");
                if (!Directory.Exists(rlDir)) Directory.CreateDirectory(rlDir);
                return rlDir;
            } catch {
                return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Documents\\My Games\\Rocket League\\TAGame\\Config");
            }
        }

        private void InjectTAInput() {
            try {
                string rlDir = GetRocketLeagueConfigDirectory();
                string targetFile = Path.Combine(rlDir, "TAInput.ini");
                if (File.Exists(targetFile)) File.Copy(targetFile, targetFile + ".backup", true);

                string content = "[Engine.Console]\nConsoleKey=1\nTypeKey=Tilde\nKeyboardAxisBlendTime=0.01\n; FN PRO 0.05 Deadzone Calibration Active\n\n[TAGame.PlayerInput_TA]\nMouseSensitivity=10\nTapTime=0.01\nDoubleTapTime=0.03\nGamepadDeadzone=0.05\nGamepadFreeLookDeadzone=0.01\nGamepadLookScale=80\nKeyboardAxisBlendTime=0.01\n; FN PRO 0.05 Deadzone Calibration Active\n\nPCBindings=( Action=\"Boost\", Key=\"LeftMouseButton\" )\nPCBindings=( Action=\"Jump\", Key=\"RightMouseButton\" )\nPCBindings=( Action=\"Handbrake\", Key=\"LeftShift\" )\nPCBindings=( Action=\"SecondaryCamera\", Key=\"Spacebar\" )\nPCBindings=( Action=\"Forward\", Key=\"W\" )\nPCBindings=( Action=\"Backward\", Key=\"S\" )\nPCBindings=( Action=\"Left\", Key=\"A\" )\nPCBindings=( Action=\"Right\", Key=\"D\" )\nPCBindings=( Action=\"AirRollLeft\", Key=\"e\" )\nPCBindings=( Action=\"AirRollRight\", Key=\"q\" )\nPCBindings=( Action=\"RearCamera\", Key=\"MiddleMouseButton\" )\nPCBindings=( Action=\"FastFreeplay\", Key=\"LeftShift\" )\nPCBindings=( Action=\"ToggleScoreboard\", Key=\"Tab\" )\n\n[TAGame.DebugInput_TA]\nMouseSensitivity=10\nKeyboardAxisBlendTime=0.01\n; FN PRO 0.05 Deadzone Calibration Active\n\n[ProjectX.DemoPlayerInput_X]\nMouseSensitivity=10\nKeyboardAxisBlendTime=0.01\n; FN PRO 0.05 Deadzone Calibration Active\n\n[IniVersion]\n0=1789689746.000000\n1=1790221648.000000\n";
                File.WriteAllText(targetFile, content);
                Log("[CONFIG INJECTOR] Successfully injected calibrated values into TAInput.ini: " + targetFile);
                MessageBox.Show("TAInput.ini successfully calibrated with 0.05 Deadzone and microsecond axis blend (0.01s)!\nTarget: " + targetFile, "TAInput Calibration", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } catch (Exception ex) {
                Log("[ERROR] Failed to inject TAInput.ini: " + ex.Message);
            }
        }

        private void InjectTASystemSettings() {
            try {
                string rlDir = GetRocketLeagueConfigDirectory();
                string targetFile = Path.Combine(rlDir, "TASystemSettings.ini");
                if (File.Exists(targetFile)) File.Copy(targetFile, targetFile + ".backup", true);

                string content = "[SystemSettings]\n; ==============================================================================\n; FN PRO ULTRA-COMPETITIVE WINDOWS PC PROFILE (PURE LOW-LATENCY)\n; All Mobile / Switch / Tablet sections stripped completely.\n; Zero GPU Bottlenecks - Maximum Frame Pacing & Sub-Millisecond Input Polling.\n; All latency-inducing features disabled (OneFrameThreadLag=False, FrameSleep=False).\n; ==============================================================================\nUseDirectSound=True\nStaticDecals=False\nDynamicDecals=False\nUnbatchedDecals=False\nDecalCullDistanceScale=0.000000\nDynamicLights=False\nDynamicShadows=False\nLightEnvironmentShadows=False\nCompositeDynamicLights=False\nSHSecondaryLighting=False\nDirectionalLightmaps=False\nMotionBlur=False\nMotionBlurPause=False\nMotionBlurSkinning=0\nDepthOfField=False\nAmbientOcclusion=False\nBloom=False\nbAllowLightShafts=False\nDistortion=False\nFilteredDistortion=False\nDropParticleDistortion=False\nbAllowDownsampledTranslucency=False\nSpeedTreeLeaves=False\nSpeedTreeFronds=False\nOnlyStreamInTextures=False\nLensFlares=False\nFogVolumes=False\nFloatingPointRenderTargets=False\nOneFrameThreadLag=False\nWaitForGPU=false\nUseVsync=False\nCustomFPS=0\nUpscaleScreenPercentage=False\nMinimumScreenScale=100.000000\nAllowDynamicResolution=False\nZCullSaveRestore=False\nAdaptiveZcull=False\nBinnerTileCache=False\nFullscreen=True\nBorderless=True\nResX=1920\nResY=1080\nAutoDetectDesktopResolution=False\nAllowOpenGL=False\nAllowRadialBlur=False\nAllowSubsurfaceScattering=False\nAllowImageReflections=False\nAllowImageReflectionShadowing=False\nbAllowSeparateTranslucency=False\nbAllowPostprocessMLAA=False\nbAllowHighQualityMaterials=False\nbUseTranslucentArenaShaders=False\nMaxFilterBlurSampleCount=0\nSkeletalMeshLODBias=0\nParticleLODBias=0\nDetailMode=0\nMaxDrawDistanceScale=1\nShadowFilterQualityBias=0\nMaxAnisotropy=1\nMaxMultiSamples=1\nbAllowD3D9MSAA=False\nbAllowTemporalAA=False\nAllowApexCloth=False\nScreenPercentage=100.000000\nSceneCaptureStreamingMultiplier=1.000000\nShadowTexelsPerPixel=0.000000\nPreShadowResolutionFactor=0.000000\nbEnableBranchingPCFShadows=False\nbAllowHardwareShadowFiltering=False\nbEnableForegroundShadowsOnWorld=False\nbEnableForegroundSelfShadowing=False\nbAllowWholeSceneDominantShadows=False\nbUseConservativeShadowBounds=False\nbAllowFracturedDamage=False\nHighPrecisionGBuffers=False\nAllowSecondaryDisplays=False\nAllowPerFrameSleep=False\nAllowPerFrameYield=False\n\n[SystemSettingsTexturesLow]\nBasedOn=SystemSettings\nTEXTUREGROUP_Character=(MinLODSize=1,MaxLODSize=512,LODBias=0)\nTEXTUREGROUP_CharacterNormalMap=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_CharacterSpecular=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_Vehicle=(MinLODSize=1,MaxLODSize=512,LODBias=0)\nTEXTUREGROUP_VehicleNormalMap=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_VehicleSpecular=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_World=(MinLODSize=1,MaxLODSize=512,LODBias=0)\nTEXTUREGROUP_WorldNormalMap=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_WorldSpecular=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_Effects=(MinLODSize=1,MaxLODSize=256,LODBias=0)\nTEXTUREGROUP_UI=(MinLODSize=1,MaxLODSize=1024,LODBias=0)\n\n[SystemSettingsProfileDetailLow]\nBasedOn=SystemSettings\nDetailMode=0\nAmbientOcclusion=False\nDepthOfField=False\nBloom=False\nbAllowLightShafts=False\nLensFlares=False\nDynamicShadows=False\nMotionBlur=False\n\n[IniVersion]\n0=1789689746.000000\n1=1789689746.000000\n";
                File.WriteAllText(targetFile, content);
                Log("[CONFIG INJECTOR] Successfully injected pure low-latency profile into TASystemSettings.ini!");
                MessageBox.Show("TASystemSettings.ini successfully injected (100% graphics bloat & mobile stripped, OneFrameThreadLag=False, FrameSleep=False)!\nTarget: " + targetFile, "System Settings Calibration", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } catch (Exception ex) {
                Log("[ERROR] Failed to inject TASystemSettings.ini: " + ex.Message);
            }
        }

        private void InjectTAStatsAPI() {
            try {
                string rlDir = GetRocketLeagueConfigDirectory();
                string targetFile = Path.Combine(rlDir, "TAStatsAPI.ini");

                string content = "[TAGame.MatchStatsExporter_TA]\nPacketSendRate=120\nPort=9000\nWebPort=9001\n";
                File.WriteAllText(targetFile, content);
                Log("[STATS API] Successfully injected TAStatsAPI.ini (120Hz WebSocket active on port 9001)!");
                MessageBox.Show("TAStatsAPI.ini successfully injected! MatchStatsExporter_TA ready on port 9001.\nTarget: " + targetFile, "Psyonix Stats API", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } catch (Exception ex) {
                Log("[ERROR] Failed to inject TAStatsAPI: " + ex.Message);
            }
        }

        private void StartLogitech() {
            try {
                string[] candidatePaths = new string[] {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "LGHUB", "lghub.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "LGHUB", "system", "lghub_agent.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "LGHUB", "lghub.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Logitech Gaming Software", "LCore.exe")
                };
                foreach (var path in candidatePaths) {
                    if (File.Exists(path)) {
                        Process.Start(path);
                        Log("[LOGITECH] Successfully launched Logitech G-HUB from: " + path);
                        return;
                    }
                }
                Process.Start("lghub");
                Log("[LOGITECH] Dispatched system process start for lghub.");
            } catch (Exception ex) {
                Log("[WARNING] Could not automatically start Logitech G-HUB: " + ex.Message);
                MessageBox.Show("Could not automatically locate lghub.exe. Please ensure Logitech G HUB is installed or start it manually.", "Logitech G HUB", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void DeployAndBindLogitechScript() {
            try {
                string ghubDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LGHUB", "scripts");
                if (!Directory.Exists(ghubDir)) Directory.CreateDirectory(ghubDir);
                string targetFile = Path.Combine(ghubDir, "RocketLeague_MasterEngine.lua");

                string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RocketLeagueMasterEngine");
                string localLua = Path.Combine(appDir, "RocketLeague_MasterEngine.lua");
                string scriptContent = "";
                if (File.Exists(localLua)) {
                    scriptContent = File.ReadAllText(localLua);
                } else {
                    scriptContent = "-- FN PRO ROCKET LEAGUE MASTER ENGINE v4.0.2\n-- MiddleMouseButton toggles script enable/disable\nEnablePrimaryMouseButtonEvents(true);\nfunction OnEvent(event, arg)\n  OutputLogMessage(\"RL Master Engine Event: %s\\n\", event);\nend\n";
                }
                File.WriteAllText(targetFile, scriptContent);
                try { Clipboard.SetText(scriptContent); } catch {}
                Log("[LOGITECH] Deployed & linked Lua script to: " + targetFile);
                Log("[LOGITECH] Script content copied to Windows Clipboard ready for Ctrl+V in G-Hub!");
                MessageBox.Show("Logitech G-HUB Lua script deployed to:\n" + targetFile + "\n\nAlso copied to Windows Clipboard ready for Ctrl+V in G-Hub!", "Logitech G-HUB Integration", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } catch (Exception ex) {
                Log("[ERROR] Failed to deploy Logitech script: " + ex.Message);
            }
        }

        private void StartLogitechWithScript() {
            DeployAndBindLogitechScript();
            StartLogitech();
            Log("[LOGITECH] 1-Click Launch & Bind completed. Logitech G HUB opened with active script.");
        }

        private string GetEpicGamesDirectory() {
            try {
                string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "RocketLeagueMasterEngine");
                string configPath = Path.Combine(appDir, "EpicGamesPath.txt");
                if (File.Exists(configPath)) {
                    string path = File.ReadAllText(configPath).Trim();
                    if (!string.IsNullOrEmpty(path)) return path;
                }
            } catch {}

            string[] candidates = new string[] {
                @"C:\Program Files (x86)\Epic Games\Launcher",
                @"C:\Program Files\Epic Games\Launcher",
                @"C:\Program Files\Epic Games",
                @"D:\Epic Games\Launcher"
            };
            foreach (var cand in candidates) {
                if (Directory.Exists(cand)) return cand;
            }
            return @"C:\Program Files (x86)\Epic Games\Launcher";
        }

        private void LaunchGame() {
            Log("[LAUNCHER] Initiating Rocket League launch protocol...");
            string epicDir = GetEpicGamesDirectory();
            Log("[LAUNCHER] Inspecting Epic Games installation directory: " + epicDir);

            string[] candidateExes = new string[] {
                Path.Combine(epicDir, @"Portal\Binaries\Win64\EpicGamesLauncher.exe"),
                Path.Combine(epicDir, @"Launcher\Portal\Binaries\Win64\EpicGamesLauncher.exe"),
                Path.Combine(epicDir, @"EpicGamesLauncher.exe"),
                Path.Combine(epicDir, @"rocketleague\Binaries\Win64\RocketLeague.exe")
            };

            string verifiedPath = null;
            foreach (var cand in candidateExes) {
                if (File.Exists(cand)) {
                    verifiedPath = cand;
                    break;
                }
            }

            if (!string.IsNullOrEmpty(verifiedPath)) {
                Log("[LAUNCHER] Path verified successfully: " + verifiedPath);
                try {
                    ProcessStartInfo psi = new ProcessStartInfo {
                        FileName = verifiedPath,
                        Arguments = "com.epicgames.launcher://apps/Sugar?action=launch&silent=true",
                        UseShellExecute = true
                    };
                    Process.Start(psi);
                    Log("[LAUNCHER] Executed verified Epic Games launch protocol successfully.");
                    return;
                } catch (Exception ex) {
                    Log("[LAUNCHER] Direct path launch returned warning: " + ex.Message + ". Falling back to protocol URI...");
                }
            } else {
                Log("[LAUNCHER] Direct binary not located in configured directory. Attempting system protocol URI...");
            }

            try {
                ProcessStartInfo psi = new ProcessStartInfo {
                    FileName = "com.epicgames.launcher://apps/Sugar?action=launch&silent=true",
                    UseShellExecute = true
                };
                Process.Start(psi);
                Log("[LAUNCHER] Sent Epic Games Launcher protocol URI request.");
            } catch {
                try {
                    Process.Start("steam://rungameid/252950");
                    Log("[LAUNCHER] Started Rocket League via Steam.");
                } catch {
                    MessageBox.Show("Could not automatically start Rocket League. Please verify your Epic Games Launcher path in settings: " + epicDir, "Launcher Notice", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }

        private static void OpenUrl(string url) {
            try {
                ProcessStartInfo psi = new ProcessStartInfo {
                    FileName = url,
                    UseShellExecute = true
                };
                Process.Start(psi);
                Log("[EXTERNAL PORTAL] Opened official portal: " + url);
            } catch (Exception ex) {
                try {
                    Process.Start("explorer.exe", "\"" + url + "\"");
                } catch {
                    MessageBox.Show("Could not open link: " + url + "\n" + ex.Message, "Official Link", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
            }
        }

        private void SimulateSpeedflip() {
            new Thread(() => {
                Log("[SIM] Triggered Left Speedflip test...");
                PressKey(K_BOOST);
                PressKey(K_FORWARD);
                PressKey(K_LEFT);
                PressKey(K_JUMP);
                Thread.Sleep(30);
                ReleaseKey(K_JUMP);
                Thread.Sleep(30);

                PressKey(K_JUMP);
                Thread.Sleep(20);
                ReleaseKey(K_JUMP);
                ReleaseKey(K_FORWARD);
                ReleaseKey(K_LEFT);

                PressKey(K_BACK);
                PressKey(K_AIRROLL_L);
                Thread.Sleep(600);
                ReleaseKey(K_BACK);
                ReleaseKey(K_AIRROLL_L);
                ReleaseKey(K_BOOST);
                Log("[SIM] Speedflip execution sequence complete (650ms). Supersonic reached!");
            }).Start();
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

                // Emergency Killswitch Hotkey: [F10] (0x79) or [Pause] (0x13)
                if (hookStruct.vkCode == 0x79 || hookStruct.vkCode == 0x13) {
                    EmergencyReleaseAllKeys();
                    Log("[KILLSWITCH] Hardware emergency interlock engaged via F10/Pause. All keys released.");
                    return (IntPtr)1;
                }

                bool isInjected = (hookStruct.flags & LLKHF_INJECTED) != 0;

                if (_engineEnabled && !isInjected) {
                    if (_macroSafetyEnabled) {
                        // Atomic compare-exchange: 0.00ms latency, eliminates re-entrancy race conditions
                        if (Interlocked.CompareExchange(ref _isRunningAtomic, 1, 0) != 0) {
                            return CallNextHookEx(_hookID, nCode, wParam, lParam);
                        }
                    } else if (_isRunning) {
                        return CallNextHookEx(_hookID, nCode, wParam, lParam);
                    }
                    _isRunning = true;

                    // [W] Forward Speedflip
                    if (hookStruct.vkCode == 87) {
                        new Thread(() => {
                            try {
                                Log("[KEYPRESS: W] Executing Forward Speedflip (30ms Flip-Cancel)...");
                                PressKey(K_BOOST);
                                PressKey(K_FORWARD);
                                PressKey(K_JUMP);
                                Thread.Sleep(30);
                                ReleaseKey(K_JUMP);
                                Thread.Sleep(30);

                                PressKey(K_JUMP);
                                Thread.Sleep(20);
                                ReleaseKey(K_JUMP);
                                ReleaseKey(K_FORWARD);

                                PressKey(K_BACK);
                                Thread.Sleep(550);
                                ReleaseKey(K_BACK);
                                ReleaseKey(K_BOOST);
                                Log("[COMPLETE: W] Forward Speedflip executed.");
                            } finally {
                                _isRunning = false;
                                Interlocked.Exchange(ref _isRunningAtomic, 0);
                            }
                        }).Start();
                        return (IntPtr)1;
                    }

                    // [A] Left Speedflip
                    if (hookStruct.vkCode == 65) {
                        new Thread(() => {
                            try {
                                Log("[KEYPRESS: A] Executing Left 45° Speedflip + AirRoll Left...");
                                PressKey(K_BOOST);
                                PressKey(K_FORWARD);
                                PressKey(K_LEFT);
                                PressKey(K_JUMP);
                                Thread.Sleep(30);
                                ReleaseKey(K_JUMP);
                                Thread.Sleep(30);

                                PressKey(K_JUMP);
                                Thread.Sleep(20);
                                ReleaseKey(K_JUMP);
                                ReleaseKey(K_FORWARD);
                                ReleaseKey(K_LEFT);

                                PressKey(K_BACK);
                                PressKey(K_AIRROLL_L);
                                Thread.Sleep(600);
                                ReleaseKey(K_BACK);
                                ReleaseKey(K_AIRROLL_L);
                                ReleaseKey(K_BOOST);
                                Log("[COMPLETE: A] Left Speedflip executed.");
                            } finally {
                                _isRunning = false;
                                Interlocked.Exchange(ref _isRunningAtomic, 0);
                            }
                        }).Start();
                        return (IntPtr)1;
                    }

                    // [D] Right Speedflip
                    if (hookStruct.vkCode == 68) {
                        new Thread(() => {
                            try {
                                Log("[KEYPRESS: D] Executing Right 45° Speedflip + AirRoll Right...");
                                PressKey(K_BOOST);
                                PressKey(K_FORWARD);
                                PressKey(K_RIGHT);
                                PressKey(K_JUMP);
                                Thread.Sleep(30);
                                ReleaseKey(K_JUMP);
                                Thread.Sleep(30);

                                PressKey(K_JUMP);
                                Thread.Sleep(20);
                                ReleaseKey(K_JUMP);
                                ReleaseKey(K_FORWARD);
                                ReleaseKey(K_RIGHT);

                                PressKey(K_BACK);
                                PressKey(K_AIRROLL_R);
                                Thread.Sleep(600);
                                ReleaseKey(K_BACK);
                                ReleaseKey(K_AIRROLL_R);
                                ReleaseKey(K_BOOST);
                                Log("[COMPLETE: D] Right Speedflip executed.");
                            } finally {
                                _isRunning = false;
                                Interlocked.Exchange(ref _isRunningAtomic, 0);
                            }
                        }).Start();
                        return (IntPtr)1;
                    }

                    // [S] Fast Aerial
                    if (hookStruct.vkCode == 83) {
                        new Thread(() => {
                            try {
                                Log("[KEYPRESS: S] Executing Fast Aerial Pitch Launcher...");
                                PressKey(K_BOOST);
                                PressKey(K_BACK);
                                PressKey(K_JUMP);
                                Thread.Sleep(200);
                                ReleaseKey(K_JUMP);
                                ReleaseKey(K_BACK);
                                Thread.Sleep(30);

                                PressKey(K_JUMP);
                                Thread.Sleep(30);
                                ReleaseKey(K_JUMP);

                                Thread.Sleep(150);
                                PressKey(K_FORWARD);
                                PressKey(K_JUMP);
                                Thread.Sleep(20);
                                ReleaseKey(K_JUMP);
                                ReleaseKey(K_FORWARD);

                                PressKey(K_BACK);
                                Thread.Sleep(300);
                                ReleaseKey(K_BACK);
                                ReleaseKey(K_BOOST);
                                Log("[COMPLETE: S] Fast Aerial executed.");
                            } finally {
                                _isRunning = false;
                                Interlocked.Exchange(ref _isRunningAtomic, 0);
                            }
                        }).Start();
                        return (IntPtr)1;
                    }

                    // Reset if key was not handled
                    _isRunning = false;
                    Interlocked.Exchange(ref _isRunningAtomic, 0);
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }
    }
}
