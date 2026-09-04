from pathlib import Path
from typing import Dict, List

import cv2
import pytesseract


# --------------------------------------------------
# Tesseract configuration
# --------------------------------------------------

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# --------------------------------------------------
# Build layout-aware OCR text
# --------------------------------------------------

def build_layout_text(ocr_data: Dict) -> str:
    """
    Reconstruct OCR text using Tesseract's line information.

    This preserves the approximate document layout instead
    of treating the entire page as one continuous paragraph.
    """

    lines = {}

    total_words = len(ocr_data["text"])

    for index in range(total_words):

        word = ocr_data["text"][index].strip()

        if not word:
            continue

        try:
            confidence = float(
                ocr_data["conf"][index]
            )
        except (ValueError, TypeError):
            confidence = -1

        # Ignore completely invalid OCR entries.
        if confidence < 0:
            continue

        block_number = ocr_data["block_num"][index]
        paragraph_number = ocr_data["par_num"][index]
        line_number = ocr_data["line_num"][index]

        key = (
            block_number,
            paragraph_number,
            line_number,
        )

        left = ocr_data["left"][index]

        if key not in lines:
            lines[key] = []

        lines[key].append(
            {
                "text": word,
                "left": left,
            }
        )

    reconstructed_lines = []

    for words in lines.values():

        # Restore left-to-right ordering.
        words.sort(
            key=lambda item: item["left"]
        )

        line_text = " ".join(
            item["text"]
            for item in words
        )

        if line_text.strip():
            reconstructed_lines.append(
                line_text.strip()
            )

    return "\n".join(
        reconstructed_lines
    )


# --------------------------------------------------
# OCR a single image
# --------------------------------------------------

def extract_text_from_image(
    image_path: Path,
    language: str = "eng",
) -> Dict:
    """
    Extract text from a single processed document image.

    Uses layout-aware OCR reconstruction so that
    land-record labels and values remain easier
    to identify.
    """

    image = cv2.imread(str(image_path))

    if image is None:
        raise ValueError(
            f"Unable to read image: {image_path}"
        )

    # --------------------------------------------------
    # OCR data
    # --------------------------------------------------

    ocr_data = pytesseract.image_to_data(
        image,
        lang=language,
        config="--psm 11",
        output_type=pytesseract.Output.DICT,
    )

    # --------------------------------------------------
    # Reconstruct layout-aware text
    # --------------------------------------------------

    text = build_layout_text(
        ocr_data
    )

    # --------------------------------------------------
    # Calculate OCR confidence
    # --------------------------------------------------

    confidence_values = []

    for confidence in ocr_data["conf"]:

        try:
            value = float(confidence)

            if value >= 0:
                confidence_values.append(value)

        except (ValueError, TypeError):
            continue

    if confidence_values:

        average_confidence = (
            sum(confidence_values)
            / len(confidence_values)
        )

    else:
        average_confidence = 0.0

    return {
        "text": text.strip(),
        "confidence": round(
            average_confidence,
            2,
        ),
    }


# --------------------------------------------------
# OCR multiple pages
# --------------------------------------------------

def extract_text_from_pages(
    image_paths: List[Path],
    language: str = "eng",
) -> List[Dict]:
    """
    Run layout-aware OCR on multiple pages.
    """

    results = []

    for page_number, image_path in enumerate(
        image_paths,
        start=1,
    ):

        result = extract_text_from_image(
            image_path=image_path,
            language=language,
        )

        results.append(
            {
                "page_number": page_number,
                "image_path": str(image_path),
                "text": result["text"],
                "confidence": result["confidence"],
            }
        )

    return results