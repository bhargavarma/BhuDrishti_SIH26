from pathlib import Path
from typing import List

import cv2
import numpy as np
import pymupdf


def pdf_to_images(file_path: Path, output_dir: Path) -> List[Path]:
    """
    Convert every page of a PDF into a PNG image.
    """

    output_dir.mkdir(parents=True, exist_ok=True)

    document = pymupdf.open(file_path)
    output_paths = []

    try:
        for page_number, page in enumerate(document):
            # Render page at high resolution for better OCR later
            matrix = pymupdf.Matrix(2, 2)
            pixmap = page.get_pixmap(matrix=matrix, alpha=False)

            output_path = output_dir / f"page_{page_number + 1}.png"
            pixmap.save(output_path)

            output_paths.append(output_path)

    finally:
        document.close()

    return output_paths


def load_image(file_path: Path) -> np.ndarray:
    """
    Load an image from disk.
    """

    image = cv2.imread(str(file_path))

    if image is None:
        raise ValueError(f"Unable to read image: {file_path}")

    return image


def preprocess_image(image: np.ndarray) -> np.ndarray:
    """
    Prepare a document image for OCR.

    Processing:
    1. Convert to grayscale
    2. Remove noise
    3. Improve contrast using adaptive thresholding
    4. Correct small rotations
    """

    # 1. Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 2. Denoising
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)

    # 3. Adaptive thresholding
    thresholded = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        15,
    )

    # 4. Deskew
    deskewed = deskew_image(thresholded)

    return deskewed


def deskew_image(image: np.ndarray) -> np.ndarray:
    """
    Correct small rotation/skew in a document image.
    """

    coordinates = np.column_stack(np.where(image < 255))

    if len(coordinates) < 10:
        return image

    angle = cv2.minAreaRect(coordinates)[-1]

    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    # Ignore extremely small rotations
    if abs(angle) < 0.5:
        return image

    height, width = image.shape[:2]
    center = (width // 2, height // 2)

    rotation_matrix = cv2.getRotationMatrix2D(
        center,
        angle,
        1.0,
    )

    rotated = cv2.warpAffine(
        image,
        rotation_matrix,
        (width, height),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_REPLICATE,
    )

    return rotated


def preprocess_document(
    file_path: Path,
    output_dir: Path,
) -> List[Path]:
    """
    Process a PDF or image document.

    Returns the paths of the processed page images.
    """

    extension = file_path.suffix.lower()

    image_extensions = {
        ".jpg",
        ".jpeg",
        ".png",
        ".tif",
        ".tiff",
    }

    output_dir.mkdir(parents=True, exist_ok=True)

    # PDF document
    if extension == ".pdf":

        raw_dir = output_dir / "raw_pages"

        image_paths = pdf_to_images(
            file_path,
            raw_dir,
        )

    # Image document
    elif extension in image_extensions:

        image_paths = [file_path]

    else:
        raise ValueError(
            f"Unsupported document format: {extension}"
        )

    processed_paths = []

    for index, image_path in enumerate(image_paths):

        image = load_image(image_path)

        processed_image = preprocess_image(image)

        output_path = (
            output_dir / f"processed_page_{index + 1}.png"
        )

        cv2.imwrite(
            str(output_path),
            processed_image,
        )

        processed_paths.append(output_path)

    return processed_paths