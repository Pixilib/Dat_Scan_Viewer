import { CONSTANTS, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports, getRenderingEngine } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';
import ButtonOnToolBar from './ButtonOnToolBar';
import DropDown from './DropDown';

export default () => {
    const [files, setFiles] = useState([]);
    const viewportIdentifiant = 'CT_STACK'
    const renderingEngineId = 'myRenderingEngine';

    const buildImageId = (files) => {
        setFiles(files)

    }
    useEffect(() => {

    }, [])

    const buttonFlipV = () => {
        const renderingEngine = getRenderingEngine(renderingEngineId)

        // Get the volume viewport
        const viewport = renderingEngine.getViewport(viewportIdentifiant)


        // Flip the viewport vertically
        const { flipVertical } = viewport.getProperties();

        viewport.flip({ flipVertical: !flipVertical });

        viewport.render();
    }

    const buttonFlipH = () => {
        const renderingEngine = getRenderingEngine(renderingEngineId)

        // Get the volume viewport
        const viewport = renderingEngine.getViewport(viewportIdentifiant)


        // Flip the viewport vertically
        const { flipHorizontal } = viewport.getProperties();

        viewport.flip({ flipHorizontal: !flipHorizontal });

        viewport.render();
    }


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

            for (let imageId of imageIds) {
                const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageId)
                const fImage = await firstImage["promise"]
            }

            const volumeMetadata = makeVolumeMetadata(imageIds);
            console.log(volumeMetadata)


            const divAff = document.getElementById("viewer2");

            divAff.style.width = "500px"
            divAff.style.height = "500px"
            const renderingEngine = new RenderingEngine(renderingEngineId)

            //Definition du volume
            const volumeId = 'cornerStreamingImageVolume: myVolume';

            const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                imageIds
            }).catch((error) => {
                console.warn(error)
            });

            console.log('mon volume :', volume)

            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                },
            };

            renderingEngine.setViewports([viewportInput]);
            volume.load();

            setVolumesForViewports(renderingEngine, [{ volumeId }], [viewportIdentifiant]);

            renderingEngine.renderViewports([viewportIdentifiant]);

        }
        if (files.length > 0) {
            run()
        }

    }, [files])

    return (
        <>
            <h1>DatScan Viewer / Volume Viewport</h1>
            <Drop set={buildImageId}></Drop>
            <div id='toolbar' style={{ marginTop: '10px', marginBottom: '5px' }}>
                <ButtonOnToolBar title={"Horizontal Flip"} onClick={buttonFlipH}></ButtonOnToolBar>
                <ButtonOnToolBar title={"Vertical Flip"} onClick={buttonFlipV}></ButtonOnToolBar>
                {/* <DropDown></DropDown> */}
            </div>
            <div id='viewer2'></div>
        </>
    )
}