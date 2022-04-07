import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import setCtTransferFunctionForVolumeActor from './setCtTransferFunctionForVolumeActor';
import {
    cornerstoneStreamingImageVolumeLoader,
    sharedArrayBufferImageLoader,
} from '@cornerstonejs/streaming-image-volume-loader';

export default () => {
    const [file, setfile] = useState(0);
    const renderingEngineId = 'myEngine';
    const viewportIdentifiant = 'CT_STACK'
    const [count, setCount] = useState(0);

    let imageIdDefault = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    // const volumeName = 'CT_VOLUME_ID'; // Id of the volume less loader prefix
    // const volumeLoaderScheme = 'cornerstoneStreamingImageVolume'; // Loader id which defines which volume loader to use
    // const volumeId = `${volumeLoaderScheme}:${volumeName}`; // VolumeId with loader id + volume id

    const initVolumeLoader = async () => {
        cornerstone.volumeLoader.registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
        cornerstone.volumeLoader.registerVolumeLoader('cornerstoneStreamingImageVolume', cornerstoneStreamingImageVolumeLoader);
        // cornerstone.imageLoader.registerImageLoader('wadouri', sharedArrayBufferImageLoader);
    }

    useEffect(() => {

        const run = async () => {
            //Configuration et initialisation des libraries

            await cornerstone.init();
            await initVolumeLoader();
            initCornerstoneWADOImageLoader();


            const divAff = document.getElementById("viewer2");

            divAff.style.width = "500px"
            divAff.style.height = "500px"

            const image = imageIdDefault; //+ "?frame=" + 0
            const imageId = [image]

            const renderingEngine = new cornerstone.RenderingEngine(renderingEngineId)

            //Creation du viewport
            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: cornerstone.Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: cornerstone.CONSTANTS.ORIENTATION.SAGITTAL,
                },
            };

            console.log(cornerstone.metaData.get('ProtocolName', imageId[0]))

            renderingEngine.enableElement(viewportInput);

            //Recuperation du viewport initialisé
            const viewport = renderingEngine.getViewport(viewportIdentifiant)

            //Definition du volume
            const volumeId = 'cornerstoneStreamingImageVolume:myVolumeId';

            const volume = await cornerstone.volumeLoader.createAndCacheVolume(volumeId, {
                imageIds: imageId,
            });

            volume.load();

            viewport.setVolumes([
                { volumeId, callback: setCtTransferFunctionForVolumeActor },
            ]);

            viewport.render();

        }
        if (file !== 0) {
            // document.getElementById('toolbar2').hidden = false
            run()
        } else {
            // document.getElementById('toolbar2').hidden = true
        }

    }, [file])

    return (
        <>
            <h1>DatScan Viewer / Volume Viewport</h1>
            <Drop set={setfile}></Drop>
            <div id="viewer2"></div>
        </>
    )
}