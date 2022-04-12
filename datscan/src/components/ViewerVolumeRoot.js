import { CONSTANTS, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports, getRenderingEngine } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import React, { Component, useEffect, useState } from 'react';
import Drop from './DropZone';
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';
import FlipVerticalButton from './tools/FlipVerticalButton';
import FlipHorizontalButton from './tools/FlipHorizontalButton';
import ResetButton from './tools/ResetButton';
import ListOrientation from './tools/ListOrientation';
import { addTool, LengthTool, ToolGroupManager, StackScrollMouseWheelTool, init as ToolInit } from '@cornerstonejs/tools';
import { MouseBindings } from '@cornerstonejs/tools/dist/esm/enums';

export default () => {
    const [files, setFiles] = useState([]);
    const viewportIdentifiant = 'CT_STACK'
    const renderingEngineId = 'myRenderingEngine';
    const toolGroupId = 'STACK_TOOL_GROUP_ID'
    //Definition du volume
    const volumeId = 'cornerStreamingImageVolume: myVolume';

    const buildImageId = (files) => {
        setFiles(files)

    }

    useEffect(() => {

        const run = async () => {
            //Configuration et initialisation des libraries
            await init();
            await ToolInit();
            initCornerstoneWADOImageLoader();

            //On ajoute les outils souhaités
            addTool(LengthTool);
            addTool(StackScrollMouseWheelTool);


            //Définition du groupe qui va contenir tout les outils
            const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

            //Ajout des outils dans le groupe et en les liant au volume
            toolGroup.addTool(LengthTool.toolName, { configuration: { volumeId } });
            toolGroup.addTool(StackScrollMouseWheelTool.toolName);

            //Outil lenght sur le click gauche souris
            toolGroup.setToolActive(LengthTool.toolName, {
                bindings: [
                    {
                        mouseButton: MouseBindings.Primary,
                    },
                ],
            });

            //De base sur la molette
            toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);

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

            const viewportInput = {
                viewportId: viewportIdentifiant,
                element: divAff,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.AXIAL,
                },
            };

            renderingEngine.setViewports([viewportInput]);

            //Ajout des outils au viewport
            toolGroup.addViewport(viewportIdentifiant, renderingEngineId);

            const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                imageIds
            });

            console.log('mon volume :', volume)
            console.log("tool :", renderingEngine)

            volume.load();

            setVolumesForViewports(renderingEngine, [{ volumeId }], [viewportIdentifiant]);

            renderingEngine.renderViewports([viewportIdentifiant]);

        }
        if (files.length > 0) {
            document.getElementById('toolbar').hidden = false
            run()
        } else {
            document.getElementById('toolbar').hidden = true
        }

    }, [files])

    return (
        <>
            <h1>DatScan Viewer / Volume Viewport</h1>
            <Drop set={buildImageId}></Drop>
            <div id='toolbar' style={{ marginTop: '10px', marginBottom: '5px' }}>
                <FlipVerticalButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></FlipVerticalButton>
                <FlipHorizontalButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></FlipHorizontalButton>
                <ListOrientation renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></ListOrientation>
                <ResetButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></ResetButton>
            </div>
            <div id='viewer2'></div>
        </>
    )
}