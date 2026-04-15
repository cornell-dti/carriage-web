import React, { useState } from 'react';
import { Typography, Box } from '@mui/material';

// Define the interface for location images to export
export interface LocationImage {
  url: string;
  file?: File;
}

interface Props {
  images: LocationImage[];
  onImagesChange: (images: LocationImage[]) => void;
  maxImages?: number;
}

const LocationImagesUpload: React.FC<Props> = ({
  images = [],
  onImagesChange,
  maxImages = 4,
}) => {
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (!e.target.files || e.target.files.length === 0) return;

    // Convert FileList to array for easier handling
    const fileArray = Array.from(e.target.files);

    // Filter for valid image files and size
    const validFiles = fileArray.filter(
      (file) =>
        (file.type === 'image/png' || file.type === 'image/jpeg') &&
        file.size <= 5 * 1024 * 1024 // 5MB max
    );

    if (validFiles.length === 0) return;

    // Only take as many images as we have room for
    const availableSlots = maxImages - images.length;
    const filesToAdd = validFiles.slice(0, availableSlots);

    // Create image URLs and add to state
    const newImages = filesToAdd.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
    }));

    onImagesChange([...images, ...newImages]);
  };

  // Generate array of slots for images and upload button
  const renderSlots = () => {
    const slots = [];

    // Add existing image slots
    for (let i = 0; i < images.length; i++) {
      slots.push(
        <div
          key={`image-${i}`}
          className="w-23.5 h-23.5 border-0 rounded flex items-center justify-center relative"
        >
          <img
            src={images[i].url}
            alt={`Location ${i + 1}`}
            className="w-full h-full object-cover rounded"
          />
        </div>
      );
    }

    // Add upload button if we haven't reached the maximum
    if (images.length < maxImages) {
      slots.push(
        <div
          key="upload-button"
          className="w-23.5 h-23.5 border border-dashed border-[#ccc] rounded flex flex-col items-center justify-center cursor-pointer overflow-hidden relative hover:border-[#4285f4] hover:bg-[rgba(66,133,244,0.04)]"
        >
          <input
            id="location-images-input"
            type="file"
            accept="image/png, image/jpeg"
            multiple
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
          <label htmlFor="location-images-input">
            <div className="flex items-center justify-center text-[#4285f4]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8V16M8 12H16"
                  stroke="#4285F4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="#4285F4"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <Typography
              align="center"
              color="primary"
              sx={{ mt: 1, fontSize: '0.9rem' }}
            >
              Add Images
            </Typography>
          </label>
        </div>
      );
    }

    // Add empty slots to fill the grid
    const remainingSlots = maxImages - slots.length;
    for (let i = 0; i < remainingSlots; i++) {
      slots.push(
        <div
          key={`empty-${i}`}
          className="w-23.5 h-23.5 border border-dashed border-[#ccc] rounded flex items-center justify-center relative"
        />
      );
    }

    return slots;
  };

  return (
    <div className="mt-4 w-full">
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Location Images
      </Typography>

      <div className="flex gap-2 mb-2">{renderSlots()}</div>

      <Typography variant="caption" color="textSecondary">
        Upload up to {maxImages} images (PNG, JPG, max 5MB each)
      </Typography>
    </div>
  );
};

export default LocationImagesUpload;
