import * as cornerstone from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import setCtTransferFunctionForVolumeActor from './setCtTransferFunctionForVolumeActor';

export default () => {
    const [file, setfile] = useState(0);
    const renderingEngineId = 'myEngine';
    const viewportIdentifiant = 'CT_STACK'
    const [count, setCount] = useState(0);

    const volumeId = 'cornerStreamingImageVolume: myVolume';

    let imageIdDefault = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);

    useEffect(() => {

        const run = async () => {
            //Configuration et initialisation des libraries

            await cornerstone.init();
            initCornerstoneWADOImageLoader();
            const divAff = document.getElementById("viewer2");

            divAff.style.width = "500px"
            divAff.style.height = "500px"

            const imageId = imageIdDefault + "?frame=" + 0
            console.log(imageId)

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

            renderingEngine.enableElement(viewportInput);

            //Recuperation du viewport initialisé
            const viewport = renderingEngine.getViewport(viewportIdentifiant)

            console.log(volumeId)

            //Definition du volume
            const volume = await cornerstone.volumeLoader.createAndCacheVolume(volumeId, { imageId });

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