import requests
from bs4 import BeautifulSoup

class AccessibilityScanner:
    def __init__(self, url):
        self.url = url
        self.report = {}

    def scan(self):
        response = requests.get(self.url)
        soup = BeautifulSoup(response.text, 'html.parser')
        self.check_alt_tags(soup)
        self.check_header_tags(soup)
        self.check_link_text(soup)
        return self.report

    def check_alt_tags(self, soup):
        images = soup.find_all('img')
        alt_tags = [img.get('alt') for img in images]
        self.report['alt_tags'] = all(alt_tag is not None and alt_tag != '' for alt_tag in alt_tags)

    def check_header_tags(self, soup):
        headers = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        self.report['header_tags'] = all(header.text.strip() != '' for header in headers)

    def check_link_text(self, soup):
        links = soup.find_all('a')
        link_text = [link.get('title') or link.text.strip() for link in links]
        self.report['link_text'] = all(link != '' for link in link_text)
