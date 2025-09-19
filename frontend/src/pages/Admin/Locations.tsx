import React, { useState, useEffect } from 'react';
import { Button } from '../../components/FormElements/FormElements';
import CopyButton from '../../components/CopyButton/CopyButton';
import Notification from '../../components/Notification/Notification';
import LocationsContent from 'components/Locations/LocationsContent';
import styles from './page.module.css';
import { LocationFormModal } from 'components/Locations/LocationFormModal';
import { Location } from 'types';
import { useLocations } from 'context/LocationsContext';
import axios from '../../util/axios';
import { LocationImage } from 'components/Locations/LocationImagesUpload';
import { Box, CircularProgress } from '@mui/material';

const Locations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const loc = useLocations().locations;

  useEffect(() => {
    setLocations(loc);
  }, [loc]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { refreshLocations } = useLocations();
  const [isUploading, setIsUploading] = useState(false);

  const uploadLocationImage = async (
    id: string,
    images?: LocationImage[]
  ): Promise<Location | null> => {
    if (!images || images.length === 0) return null;
    const buffers: string[] = [];
    for (const img of images) {
      if (img.file) {
        const b64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(img.file!);
          reader.onload = function () {
            const base64 = (reader.result as string).split(',')[1] || '';
            resolve(base64);
          };
        });
        buffers.push(b64);
      }
    }
    if (buffers.length === 0) return null;
    const resp = await axios.post('/api/upload/', {
      id,
      tableName: 'Locations',
      fileBuffers: buffers,
    });
    const data = resp.data?.data || resp.data; // db.update sends { data }
    return data || null;
  };

  const handleAddLocation = async (
    newLocation: Location & { imagesList?: LocationImage[] }
  ) => {
    // Create location
    const payload: Partial<Location> = {
      name: newLocation.name,
      shortName: newLocation.shortName,
      address: newLocation.address,
      info: newLocation.info,
      tag: newLocation.tag,
      lat: newLocation.lat,
      lng: newLocation.lng,
    };
    const created: Location = await axios
      .post('/api/locations', payload)
      .then((r) => r.data)
      .then((d) => d.data);
    const createdWithTempImages: any = {
      ...created,
      imagesList: newLocation.imagesList || [],
    };
    setLocations((prev) =>
      [...prev, createdWithTempImages].sort((a, b) =>
        a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      )
    );
    setIsAddDialogOpen(false);

    setIsUploading(true);
    const updated = await uploadLocationImage(
      created.id,
      newLocation.imagesList
    );
    setIsUploading(false);
    if (updated) {
      setLocations((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
    }
  };

  useEffect(() => {
    document.title = 'Locations';
  }, []);

  const handleUpdateLocation = async (
    updatedLocation: Location & { imagesList?: LocationImage[] }
  ) => {
    const { id, imagesList, ...rest } = updatedLocation;
    const payload: Partial<Location> = {
      name: rest.name,
      shortName: rest.shortName,
      address: rest.address,
      info: rest.info,
      tag: rest.tag,
      lat: rest.lat,
      lng: rest.lng,
      // photoLink is updated via upload endpoint
    };
    const updated: Location = await axios
      .put(`/api/locations/${id}`, payload)
      .then((r) => r.data)
      .then((d) => d.data);
    const updatedWithTempImages: any = {
      ...updated,
      imagesList:
        imagesList && imagesList.length
          ? imagesList
          : (updated as any).imagesList,
    };
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? updatedWithTempImages : l))
    );

    setIsUploading(true);
    const withImages = await uploadLocationImage(id, imagesList);
    setIsUploading(false);
    if (withImages) {
      setLocations((prev) => prev.map((l) => (l.id === id ? withImages : l)));
    }
  };

  return (
    <main id="main" className={styles.main}>
      <div className={styles.pageTitle}>
        <h1 className={styles.header}>Locations</h1>
        <div className={styles.rightSection}>
          <CopyButton />
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className={styles.addButton}
          >
            + Add Location
          </Button>
          <Notification />
          {isUploading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
              <CircularProgress size={18} />
              <span>Uploading images…</span>
            </Box>
          )}
        </div>
      </div>

      <LocationsContent
        locations={locations}
        onUpdateLocation={handleUpdateLocation}
      />

      <LocationFormModal
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddLocation}
        mode="add"
      />
    </main>
  );
};

export default Locations;
