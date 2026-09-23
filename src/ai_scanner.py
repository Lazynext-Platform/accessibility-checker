import os
import json
from accessibility_checker import AccessibilityChecker

class AiScanner:
    def __init__(self, url):
        self.url = url
        self.accessibility_checker = AccessibilityChecker()

    def scan(self):
        # Call the wcag-scanner.js using nodejs child process
        import subprocess
        process = subprocess.Popen(['node', 'src/scanner.js', self.url], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = process.communicate()

        if process.returncode != 0:
            raise Exception("Failed to scan the website")

        # Parse the output from wcag-scanner.js
        try:
            results = json.loads(output.decode('utf-8'))
        except json.JSONDecodeError:
            raise Exception("Failed to parse the scan results")

        # Use the AccessibilityChecker to analyze the results
        issues = self.accessibility_checker.analyze(results)

        return issues

    def get_recommendations(self, issues):
        # Use the AccessibilityChecker to get recommendations for the issues
        recommendations = self.accessibility_checker.get_recommendations(issues)

        return recommendations

def main():
    url = "https://example.com"  # Replace with the website URL to scan
    ai_scanner = AiScanner(url)
    issues = ai_scanner.scan()
    recommendations = ai_scanner.get_recommendations(issues)

    print("Accessibility Issues:")
    for issue in issues:
        print(issue)

    print("Recommendations:")
    for recommendation in recommendations:
        print(recommendation)

if __name__ == "__main__":
    main()