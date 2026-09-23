import os
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from accessibility_checker import AccessibilityChecker

class AIScanner:
    def __init__(self, url):
        self.url = url
        self.accessibility_checker = AccessibilityChecker()

    def scan(self):
        try:
            # Initialize Chrome driver
            driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

            # Navigate to the URL
            driver.get(self.url)

            # Wait for the page to load
            timeout = 10  # seconds
            WebDriverWait(driver, timeout).until(EC.presence_of_all_elements_located((By.TAG_NAME, 'body')))

            # Get the HTML content of the page
            html = driver.page_source

            # Parse the HTML content using BeautifulSoup
            soup = BeautifulSoup(html, 'html.parser')

            # Remove all script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Get the text from the HTML content
            text = soup.get_text()

            # Break the text into lines and remove leading and trailing space on each line
            lines = (line.strip() for line in text.splitlines())

            # Break multi-headlines into a line each
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))

            # Drop blank lines
            text = '\n'.join(chunk for chunk in chunks if chunk)

            # Check for accessibility issues
            issues = self.accessibility_checker.check(text)

            # Close the Chrome driver
            driver.quit()

            return issues

        except TimeoutException:
            print("Timed out waiting for page to load")
            return None

        except Exception as e:
            print("An error occurred: ", str(e))
            return None

def main():
    url = "https://example.com"
    ai_scanner = AIScanner(url)
    issues = ai_scanner.scan()
    if issues:
        print("Accessibility issues found:")
        for issue in issues:
            print(issue)
    else:
        print("No accessibility issues found.")

if __name__ == "__main__":
    main()