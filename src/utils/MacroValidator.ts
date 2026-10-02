import { MacroConfig } from '../types';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  type: 'syntax' | 'logic_conflict' | 'ghub_limitation' | 'hardware_collision';
  title: string;
  message: string;
  line?: number;
  snippet?: string;
  recommendation?: string;
}

export interface ValidationReport {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  linesAnalyzed: number;
  analyzedAt: string;
  readinessScore: number; // 0 to 100
}

/**
 * MacroValidator
 * Parses generated Lua macro code and inspects configuration for:
 * 1. Lua 5.1 syntax errors (unbalanced brackets, quotes, block keywords).
 * 2. Logitech G-Hub sandbox limitations (single-thread blocking, mouse vs key dispatchers).
 * 3. G502X hardware conflicts and duplicate button collisions.
 * 4. Rocket League gameplay key collisions and timing anomalies.
 */
export class MacroValidator {
  /**
   * Main entry point: validates Lua code string and optional configuration.
   */
  public static validate(luaCode: string, config?: MacroConfig): ValidationReport {
    const issues: ValidationIssue[] = [];
    const lines = luaCode.split('\n');

    // 1. Basic structural checks
    if (!luaCode || luaCode.trim().length === 0) {
      issues.push({
        id: 'EMPTY_CODE',
        severity: 'error',
        type: 'syntax',
        title: 'Empty Macro Script',
        message: 'The generated Lua script contains no code.',
        recommendation: 'Ensure configuration generates a valid template.',
      });

      return {
        isValid: false,
        errorCount: 1,
        warningCount: 0,
        infoCount: 0,
        issues,
        linesAnalyzed: 0,
        analyzedAt: new Date().toLocaleTimeString(),
        readinessScore: 0,
      };
    }

    // 2. Syntax & Bracket Matching
    this.checkSyntaxAndBrackets(lines, issues);

    // 3. Block Keyword Pairing (function/if/do/while vs end)
    this.checkBlockPairs(lines, issues);

    // 4. Logitech G-Hub Sandbox Limitations
    this.checkGHubSandboxRules(lines, luaCode, issues);

    // 5. Hardware Collisions & Logic Conflicts
    this.checkHardwareAndLogicConflicts(lines, config, issues);

    // 6. Timing and Delay Sanity
    this.checkTimingDelays(lines, issues);

    // Calculate score
    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;
    const infoCount = issues.filter((i) => i.severity === 'info').length;

    let readinessScore = 100 - errorCount * 35 - warningCount * 10;
    if (readinessScore < 0) readinessScore = 0;
    if (errorCount > 0 && readinessScore > 50) readinessScore = 40;

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      issues,
      linesAnalyzed: lines.length,
      analyzedAt: new Date().toLocaleTimeString(),
      readinessScore,
    };
  }

  /**
   * Checks balanced parenthesis, brackets, and curly braces while ignoring comments and strings.
   */
  private static checkSyntaxAndBrackets(lines: string[], issues: ValidationIssue[]): void {
    let parenCount = 0;
    let bracketCount = 0;
    let braceCount = 0;
    let inMultiLineComment = false;

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      let trimmed = lineText.trim();

      // Multi-line comment tracking
      if (inMultiLineComment) {
        if (trimmed.includes(']]')) {
          inMultiLineComment = false;
        }
        return;
      }
      if (trimmed.includes('--[[')) {
        inMultiLineComment = true;
        return;
      }

      // Strip single-line comments
      const commentIdx = lineText.indexOf('--');
      const cleanLine = commentIdx >= 0 ? lineText.slice(0, commentIdx) : lineText;

      let inDoubleQuote = false;
      let inSingleQuote = false;

      for (let i = 0; i < cleanLine.length; i++) {
        const char = cleanLine[i];
        const prev = i > 0 ? cleanLine[i - 1] : '';

        if (char === '"' && prev !== '\\' && !inSingleQuote) {
          inDoubleQuote = !inDoubleQuote;
          continue;
        }
        if (char === "'" && prev !== '\\' && !inDoubleQuote) {
          inSingleQuote = !inSingleQuote;
          continue;
        }

        if (inDoubleQuote || inSingleQuote) continue;

        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
        else if (char === '[') bracketCount++;
        else if (char === ']') bracketCount--;
        else if (char === '{') braceCount++;
        else if (char === '}') braceCount--;

        if (parenCount < 0) {
          issues.push({
            id: `UNEXPECTED_RPAREN_${lineNum}`,
            severity: 'error',
            type: 'syntax',
            title: 'Unexpected Closing Parenthesis',
            message: `Extra closing ')' encountered on line ${lineNum}.`,
            line: lineNum,
            snippet: lineText.trim(),
            recommendation: 'Check parenthesis matching on this line.',
          });
          parenCount = 0;
        }

        if (bracketCount < 0) {
          issues.push({
            id: `UNEXPECTED_RBRACKET_${lineNum}`,
            severity: 'error',
            type: 'syntax',
            title: 'Unexpected Closing Bracket',
            message: `Extra closing ']' encountered on line ${lineNum}.`,
            line: lineNum,
            snippet: lineText.trim(),
            recommendation: 'Check table indexing or bracket syntax on this line.',
          });
          bracketCount = 0;
        }

        if (braceCount < 0) {
          issues.push({
            id: `UNEXPECTED_RBRACE_${lineNum}`,
            severity: 'error',
            type: 'syntax',
            title: 'Unexpected Closing Brace',
            message: `Extra closing '}' encountered on line ${lineNum}.`,
            line: lineNum,
            snippet: lineText.trim(),
            recommendation: 'Check table definition formatting on this line.',
          });
          braceCount = 0;
        }
      }

      if (inDoubleQuote || inSingleQuote) {
        issues.push({
          id: `UNTERMINATED_STRING_${lineNum}`,
          severity: 'error',
          type: 'syntax',
          title: 'Unterminated String Literal',
          message: `Line ${lineNum} contains an unclosed string literal.`,
          line: lineNum,
          snippet: lineText.trim(),
          recommendation: 'Ensure quotes are paired on the same line or use multi-line [[...]].',
        });
      }
    });

    if (parenCount > 0) {
      issues.push({
        id: 'UNCLOSED_PARENS',
        severity: 'error',
        type: 'syntax',
        title: 'Unclosed Parenthesis',
        message: `${parenCount} unclosed opening parenthesis '(' detected in the script.`,
        recommendation: 'Verify that every function call or conditional closes all parenthesis.',
      });
    }

    if (bracketCount > 0) {
      issues.push({
        id: 'UNCLOSED_BRACKETS',
        severity: 'error',
        type: 'syntax',
        title: 'Unclosed Brackets',
        message: `${bracketCount} unclosed square bracket '[' detected in the script.`,
        recommendation: 'Verify table indices or arrays are properly closed.',
      });
    }

    if (braceCount > 0) {
      issues.push({
        id: 'UNCLOSED_BRACES',
        severity: 'error',
        type: 'syntax',
        title: 'Unclosed Braces',
        message: `${braceCount} unclosed table brace '{' detected in the script.`,
        recommendation: 'Verify table definitions like BINDINGS = {...} end with a closing brace.',
      });
    }
  }

  /**
   * Checks function/if/while/for pairing with end.
   */
  private static checkBlockPairs(lines: string[], issues: ValidationIssue[]): void {
    let blockCount = 0;
    let inMultiLineComment = false;

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const clean = lineText.trim();

      if (inMultiLineComment) {
        if (clean.includes(']]')) inMultiLineComment = false;
        return;
      }
      if (clean.startsWith('--[[')) {
        inMultiLineComment = true;
        return;
      }
      if (clean.startsWith('--')) return;

      // Extract tokens separated by word boundaries
      const tokens = clean
        .replace(/--.*$/, '') // strip line comments
        .replace(/"[^"]*"/g, '""') // strip strings
        .replace(/'[^']*'/g, "''")
        .split(/\s+|[(),;]/)
        .filter((t) => t.length > 0);

      tokens.forEach((token) => {
        if (token === 'function' || token === 'then' || token === 'do') {
          blockCount++;
        } else if (token === 'end') {
          blockCount--;
        }
      });

      if (blockCount < 0) {
        issues.push({
          id: `UNEXPECTED_END_${lineNum}`,
          severity: 'error',
          type: 'syntax',
          title: "Unexpected 'end' Statement",
          message: `Extra 'end' keyword detected on line ${lineNum} without matching block opener.`,
          line: lineNum,
          snippet: clean,
          recommendation: 'Remove extraneous "end" or verify function/if structure.',
        });
        blockCount = 0;
      }
    });

    if (blockCount > 0) {
      issues.push({
        id: 'MISSING_END_BLOCK',
        severity: 'error',
        type: 'syntax',
        title: "Missing 'end' Statement",
        message: `${blockCount} unclosed block(s) detected. Lua requires every function, if-then, and loop to close with 'end'.`,
        recommendation: 'Add missing "end" keywords to close opened blocks.',
      });
    }
  }

  /**
   * Checks Logitech G-Hub specific limitations and traps.
   */
  private static checkGHubSandboxRules(lines: string[], luaCode: string, issues: ValidationIssue[]): void {
    // 1. Single OnEvent rule: G-Hub allows ONLY ONE OnEvent function
    const onEventMatches = luaCode.match(/function\s+OnEvent\s*\(/g);
    if (onEventMatches && onEventMatches.length > 1) {
      issues.push({
        id: 'MULTIPLE_ONEVENT',
        severity: 'error',
        type: 'ghub_limitation',
        title: 'Multiple OnEvent Handlers Detected',
        message: `Found ${onEventMatches.length} definitions of OnEvent(). In Logitech G-Hub, defining multiple OnEvent functions silently overwrites previous handlers.`,
        recommendation: 'Combine all macro triggers into a single centralized OnEvent(event, arg) function.',
      });
    } else if (!onEventMatches || onEventMatches.length === 0) {
      issues.push({
        id: 'MISSING_ONEVENT',
        severity: 'error',
        type: 'ghub_limitation',
        title: 'Missing OnEvent Handler',
        message: 'No OnEvent(event, arg) function was found. G-Hub relies exclusively on OnEvent to receive mouse/keyboard events.',
        recommendation: 'Include function OnEvent(event, arg) in the script.',
      });
    }

    // 2. EnablePrimaryMouseButtonEvents check
    if (!luaCode.includes('EnablePrimaryMouseButtonEvents')) {
      issues.push({
        id: 'MISSING_PRIMARY_MOUSE_EVENTS',
        severity: 'warning',
        type: 'ghub_limitation',
        title: 'Primary Mouse Events Disabled',
        message: 'EnablePrimaryMouseButtonEvents(true) not detected in PROFILE_ACTIVATED.',
        recommendation: 'Call EnablePrimaryMouseButtonEvents(true) inside PROFILE_ACTIVATED so G-Hub listens for clicks on MB1/MB2.',
      });
    }

    // 3. Raw PressKey with "mouse" parameter trap
    // In G-Hub, calling PressKey("mouse1") or PressKey(1) throws "Lua Error: invalid argument"
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const clean = lineText.trim();
      if (clean.startsWith('--')) return;

      const directPressMatch = clean.match(/PressKey\s*\(\s*["'](mouse[0-9]|lclick|rclick)["']\s*\)/i);
      if (directPressMatch) {
        issues.push({
          id: `INVALID_PRESSKEY_MOUSE_${lineNum}`,
          severity: 'error',
          type: 'ghub_limitation',
          title: 'Invalid Mouse Argument in PressKey',
          message: `Line ${lineNum} calls PressKey() with mouse argument "${directPressMatch[1]}". G-Hub throws runtime error on this call.`,
          line: lineNum,
          snippet: clean,
          recommendation: 'Use PressMouseButton(1..5) or the polymorphic SafePress() dispatcher instead.',
        });
      }
    });

    // 4. Missing Emergency Release handler
    if (!luaCode.includes('EmergencyReleaseAll') && !luaCode.includes('ReleaseKey') && !luaCode.includes('ReleaseMouseButton')) {
      issues.push({
        id: 'NO_RELEASE_LOGIC',
        severity: 'warning',
        type: 'ghub_limitation',
        title: 'Missing Key Release Safety',
        message: 'No key release calls or EmergencyReleaseAll handler found. This can lead to permanently stuck keys.',
        recommendation: 'Implement an EmergencyReleaseAll() function that releases Jump, Boost, and Direction keys.',
      });
    }
  }

  /**
   * Checks for button collisions, duplicate triggers, and G502X hardware logic conflicts.
   */
  private static checkHardwareAndLogicConflicts(
    lines: string[],
    config: MacroConfig | undefined,
    issues: ValidationIssue[]
  ): void {
    if (config) {
      // Direct config validation:
      const mouseAssignments: Record<string, number> = {
        'Middle Toggle': config.mouseToggle,
        'Speedflip (MB4)': config.mouseSpeedflip,
        'Chain Dash (MB5)': config.mouseChaindash,
      };

      const usedButtons = new Map<number, string[]>();
      for (const [action, btn] of Object.entries(mouseAssignments)) {
        if (!usedButtons.has(btn)) usedButtons.set(btn, []);
        usedButtons.get(btn)!.push(action);
      }

      for (const [btn, actions] of usedButtons.entries()) {
        if (actions.length > 1) {
          issues.push({
            id: `COLLISION_MOUSE_BTN_${btn}`,
            severity: 'error',
            type: 'hardware_collision',
            title: `Mouse Button ${btn} Collision`,
            message: `Button ${btn} is simultaneously assigned to multiple actions: ${actions.join(', ')}.`,
            recommendation: 'Assign each macro function to a separate button.',
          });
        }
      }

      // Check G502X specific buttons: G6 (Sniper) vs MB5 (Side Forward)
      if (config.mouseChaindash === config.mouseSpeedflip) {
        issues.push({
          id: 'G502X_MB4_MB5_OVERLAP',
          severity: 'error',
          type: 'logic_conflict',
          title: 'Side Button Assignment Conflict',
          message: 'MB4 (Speedflip) and MB5 (Chaindash) are set to the same physical button.',
          recommendation: 'Set Speedflip to MB4 (Button 4) and Chaindash to MB5 (Button 5).',
        });
      }

      // Game Key Collisions
      const gameKeys: Record<string, string> = {
        Forward: config.keyForward,
        Back: config.keyBack,
        Left: config.keyLeft,
        Right: config.keyRight,
        Jump: config.keyJump,
        Boost: config.keyBoost,
      };

      if (config.keyLeft.toLowerCase() === config.keyRight.toLowerCase()) {
        issues.push({
          id: 'KEY_LEFT_RIGHT_COLLISION',
          severity: 'error',
          type: 'logic_conflict',
          title: 'Directional Key Conflict',
          message: `Left and Right controls are assigned to the same key "${config.keyLeft}".`,
          recommendation: 'Use distinct keys (e.g., A for Left and D for Right).',
        });
      }

      if (config.keyForward.toLowerCase() === config.keyBack.toLowerCase()) {
        issues.push({
          id: 'KEY_FWD_BACK_COLLISION',
          severity: 'error',
          type: 'logic_conflict',
          title: 'Pitch Direction Collision',
          message: `Forward and Back controls are assigned to the same key "${config.keyForward}".`,
          recommendation: 'Use distinct keys (e.g., W for Forward and S for Back).',
        });
      }

      if (config.keyJump.toLowerCase() === config.keyBoost.toLowerCase()) {
        issues.push({
          id: 'KEY_JUMP_BOOST_COLLISION',
          severity: 'warning',
          type: 'logic_conflict',
          title: 'Jump and Boost Key Overlap',
          message: `Jump and Boost are bound to the identical input "${config.keyJump}". Fast aerial cancel will fail.`,
          recommendation: 'Differentiate Jump and Boost bindings (e.g., mouse2 for Jump and mouse1 for Boost).',
        });
      }
    }

    // Inspect BINDINGS table in Lua code
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const clean = lineText.trim();

      // Check if MB5 and G6 are accidentally mapped to the same number in script
      if (clean.includes('MB5') && clean.includes('6') && clean.includes('G6') && clean.includes('5')) {
        issues.push({
          id: `G502X_INVERTED_MAPPING_${lineNum}`,
          severity: 'warning',
          type: 'hardware_collision',
          title: 'G502X Inverted Button Notice',
          message: `Line ${lineNum} appears to invert G6 (Sniper) and MB5 (Side Forward).`,
          line: lineNum,
          snippet: clean,
          recommendation: 'On Logitech G502X, MB5 is typically Button 5 and G6 Sniper is Button 6.',
        });
      }
    });
  }

  /**
   * Checks Sleep() values for unsafe delays or infinite hangs.
   */
  private static checkTimingDelays(lines: string[], issues: ValidationIssue[]): void {
    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const clean = lineText.trim();
      if (clean.startsWith('--')) return;

      const sleepMatch = clean.match(/Sleep\s*\(\s*([0-9]+)\s*\)/);
      if (sleepMatch) {
        const ms = parseInt(sleepMatch[1], 10);
        if (ms <= 0) {
          issues.push({
            id: `ZERO_SLEEP_${lineNum}`,
            severity: 'warning',
            type: 'ghub_limitation',
            title: 'Zero or Negative Sleep Duration',
            message: `Sleep(${ms}) on line ${lineNum} will yield CPU tick without guaranteeing hardware frame dispatch.`,
            line: lineNum,
            snippet: clean,
            recommendation: 'Use minimum 15-20ms sleep duration for reliable 120Hz physics tick sampling.',
          });
        } else if (ms > 1500) {
          issues.push({
            id: `LONG_SLEEP_${lineNum}`,
            severity: 'warning',
            type: 'ghub_limitation',
            title: 'Excessive Blocking Sleep Duration',
            message: `Sleep(${ms}) on line ${lineNum} halts G-Hub event loop for ${(ms / 1000).toFixed(1)} seconds, preventing any other mouse movements.`,
            line: lineNum,
            snippet: clean,
            recommendation: 'Keep individual sleep intervals under 600ms or check button release.',
          });
        }
      }
    });
  }
}
