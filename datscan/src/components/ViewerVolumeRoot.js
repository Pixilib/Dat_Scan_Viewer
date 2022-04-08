import { CONSTANTS, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import setCtTransferFunctionForVolumeActor from './setCtTransferFunctionForVolumeActor';
import {
    cornerstoneStreamingImageVolumeLoader,
    sharedArrayBufferImageLoader,
} from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';

export default () => {
    const [files, setFiles] = useState([]);

    const viewportIdentifiant = 'CT_STACK'
    const [count, setCount] = useState(0);


    // const volumeName = 'CT_VOLUME_ID'; // Id of the volume less loader prefix
    // const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
    // const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id

    const buildImageId = (files) => {
        setFiles(files)

    }
    useEffect(() => {

    }, [])


    useEffect(() => {

        const run = async () => {
            //Configuration et initialisation des libraries
            await init();
            initCornerstoneWADOImageLoader();
            volumeLoader.registerVolumeLoader('cornerStreamingImageVolume', cornerstoneStreamingImageVolumeLoader);
            let imageIds = []
            files.forEach(file => {
                let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                console.log(imageId)
                imageIds.push(imageId)
            });
            const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageIds[0])
            const fImage = await firstImage["promise"]
            const volumeMetadata = makeVolumeMetadata(imageIds);
            console.log(volumeMetadata)

            console.log(volumeLoader)

            const divAff = document.getElementById("viewer2");

            divAff.style.width = "500px"
            divAff.style.height = "500px"
            const renderingEngineId = 'myRenderingEngine';
            const renderingEngine = new RenderingEngine(renderingEngineId)

            //Definition du volume
            const volumeId = 'cornerStreamingImageVolume: myVolume';

            // const volume = await volumeLoader.createAndCacheVolume(volumeId, {
            //     imageIds
            // }).catch((error) => {
            //     console.warn(error)
            // });

            const volume = volumeLoader.loadVolume(volumeId, { imageIds });

            console.log('mon volume :', volume)

            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                },
            };

            renderingEngine.enableElement(viewportInput);

            const viewport = renderingEngine.getViewport(viewportIdentifiant)

            volume.load();

            viewport.setVolumes([
                { volumeId, callback: setCtTransferFunctionForVolumeActor },
            ]);

            viewport.render();

        }

        run()
    }, [files])

    return (
        <>
            <h1>DatScan Viewer / Volume Viewport</h1>
            <Drop set={buildImageId}></Drop>
            <div id="viewer2"></div>
        </>
    )
}