"""Core accessibility analysis engine for Accessibility Checker.

Provides AccessibilityChecker — static WCAG checks over HTML or plain text.
Used by src/modules/scanner/ai_scanner.py and runnable standalone:

    python3 accessibility_checker.py <url-or-file>
"""

import re
import sys


class AccessibilityChecker:
    """Runs static WCAG 2.1 checks against HTML markup or extracted text."""

    def check(self, content: str) -> list:
        """Return a list of issue strings found in HTML markup or text."""
        issues = []
        html = content or ""
        is_markup = "<" in html and ">" in html

        if is_markup:
            issues += self._check_markup(html)
        else:
            issues += self._check_text(html)
        return issues or ["No accessibility issues found."]

    # --- markup checks ------------------------------------------------------

    def _check_markup(self, html: str) -> list:
        issues = []
        lower = html.lower()

        if "<html" in lower and not re.search(r"<html[^>]*\blang=", lower):
            issues.append("WCAG 3.1.1: <html> is missing a lang attribute")

        if "<head" in lower and "<title" not in lower:
            issues.append("WCAG 2.4.2: page is missing a <title>")

        for m in re.finditer(r"<img\b[^>]*>", html, re.I):
            tag = m.group(0)
            if "alt=" not in tag.lower():
                issues.append(f"WCAG 1.1.1: <img> missing alt text: {tag[:80]}")

        headings = [(int(m.group(1)), m.group(0)) for m in re.finditer(r"<h([1-6])\b[^>]*>", html, re.I)]
        if headings:
            if headings[0][0] != 1:
                issues.append("WCAG 1.3.1: first heading is not <h1>")
            prev = 0
            for level, tag in headings:
                if level > prev + 1 and prev:
                    issues.append(f"WCAG 1.3.1: heading level skipped ({tag} after h{prev})")
                prev = level
        elif is_markup:
            issues.append("WCAG 1.3.1: no headings found on the page")

        for m in re.finditer(r"<input\b[^>]*>", html, re.I):
            tag = m.group(0)
            if re.search(r'type=["\'](?:hidden|submit|button|image)', tag, re.I):
                continue
            idm = re.search(r'\bid=["\']([^"\']+)', tag)
            if not (idm and re.search(r'<label[^>]*\bfor=["\']' + re.escape(idm.group(1)), html, re.I)) and "aria-label" not in tag.lower():
                issues.append(f"WCAG 3.3.2: <input> has no associated label: {tag[:80]}")

        for m in re.finditer(r"<a\b[^>]*>(.*?)</a>", html, re.I | re.S):
            text = re.sub(r"<[^>]+>", "", m.group(1)).strip().lower()
            if text in {"click here", "here", "read more", "more", "link"}:
                issues.append(f"WCAG 2.4.4: vague link text \"{text}\"")

        if "<meta" in lower and 'name="viewport"' in lower and "user-scalable=no" in lower:
            issues.append("WCAG 1.4.4: viewport disables zoom (user-scalable=no)")

        if not re.search(r'role=["\'](?:main|banner|navigation|contentinfo)', lower) and "<main" not in lower:
            issues.append("WCAG 1.3.1: no landmark region (<main> or role) found")

        return issues

    # --- plain-text checks --------------------------------------------------

    def _check_text(self, text: str) -> list:
        issues = []
        if len(text.strip()) < 40:
            issues.append("Content is very short — a page this thin often lacks context for assistive tech")
        if re.search(r"\b(click here|read more)\b", text, re.I):
            issues.append("WCAG 2.4.4: vague link language present in extracted text")
        return issues


if __name__ == "__main__":
    import urllib.request

    if len(sys.argv) < 2:
        print("usage: python3 accessibility_checker.py <url-or-file>")
        sys.exit(1)
    src = sys.argv[1]
    data = urllib.request.urlopen(src, timeout=15).read().decode("utf-8", "replace") if src.startswith("http") else open(src).read()
    for i in AccessibilityChecker().check(data):
        print("-", i)
