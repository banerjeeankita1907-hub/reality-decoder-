import unittest

from validation import normalize_limit, validate_content_request


class ContentValidationTests(unittest.TestCase):
    def test_text_is_trimmed_and_has_no_domain(self):
        self.assertEqual(
            validate_content_request("  A short article  ", "text"),
            ("A short article", "text", None),
        )

    def test_rejects_empty_and_non_string_content(self):
        for value in ("  ", None, 123, []):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    validate_content_request(value, "text")

    def test_enforces_content_size(self):
        with self.assertRaisesRegex(ValueError, "4000 characters"):
            validate_content_request("x" * 4001, "text")

    def test_rejects_unknown_content_types(self):
        with self.assertRaisesRegex(ValueError, "content_type"):
            validate_content_request("some text", "video")

    def test_url_requires_http_or_https_and_a_host(self):
        for value in ("example.com", "ftp://example.com/file", "https:///missing-host"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    validate_content_request(value, "url")

    def test_url_hostname_is_normalized(self):
        self.assertEqual(
            validate_content_request(" HTTPS://Example.COM./story ", "url"),
            ("HTTPS://Example.COM./story", "url", "example.com"),
        )

    def test_rejects_credentials_inside_urls(self):
        with self.assertRaisesRegex(ValueError, "credentials"):
            validate_content_request("https://user:pass@example.com/private", "url")

    def test_page_limits_are_bounded(self):
        self.assertEqual(normalize_limit(0, default=20, maximum=100), 1)
        self.assertEqual(normalize_limit(-8, default=20, maximum=100), 1)
        self.assertEqual(normalize_limit(10000, default=20, maximum=100), 100)
        self.assertEqual(normalize_limit("not-an-int", default=20, maximum=100), 20)
        self.assertEqual(normalize_limit(True, default=20, maximum=100), 20)


if __name__ == "__main__":
    unittest.main()
