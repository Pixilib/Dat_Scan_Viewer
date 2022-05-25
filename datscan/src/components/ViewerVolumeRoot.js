import React, { Component, useEffect, useState } from 'react';
import { CONSTANTS, cache, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports, getRenderingEngine, VolumeViewport, utilities as csCoreUti } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';
import { addTool, LengthTool, CrosshairsTool, ToolGroupManager, SegmentationDisplayTool, StackScrollMouseWheelTool, ZoomTool, init as ToolInit, BrushTool, RectangleScissorsTool, CircleScissorsTool, SphereScissorsTool, Enums as csEnums, utilities as CsToolsUtils, RectangleROIThresholdTool, segmentation, EllipticalROITool } from '@cornerstonejs/tools';
import CoordsOnCursor from './tools/coordsOnCursor';
import Drop from './DropZone';
import RectangleRoiTreshold from './tools/rectangleRoiTreshold';
import ListOrientation from './tools/ListOrientation';
import GaeloCrosshair from './tools/gaeloCrosshair';


export default ({ view, renderID, viewPID }) => {
    const [files, setFiles] = useState([]);
    const toolGroupId = 'STACK_TOOL_GROUP_ID'
    const viewportId1 = 'Viewport1';
    const viewportId2 = 'Viewport2';
    const viewportId3 = 'CT_CORONAL';
    let volumeId = 'cornerStreamingImageVolume: myVolume';

    const buildImageId = (files) => {
        setFiles(files)

    }

    useEffect(() => {

        const run = async () => {
            if (ToolGroupManager.getToolGroup(toolGroupId) != null) {

                let imageIds = []
                files.forEach(file => {
                    let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                    imageIds.push(imageId)
                });

                for (let imageId of imageIds) {
                    const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageId)
                    const fImage = await firstImage["promise"]
                }

                const volumeMetadata = makeVolumeMetadata(imageIds);
                const element2 = document.getElementById(view);

                element2.oncontextmenu = (e) => e.preventDefault();

                volumeId = 'cornerStreamingImageVolume: myVolumetwo';

                const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                    imageIds
                });
                const renderingEngine = new RenderingEngine(renderID);
                const viewportInput = [{
                    viewportId: viewPID,
                    element: element2,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.AXIAL,
                        background: [0, 0, 0],
                    },
                }];

                renderingEngine.setViewports(viewportInput);

                const viewport = renderingEngine.getViewport(viewPID);

                volume.load();

                console.log(cache);

                await setVolumesForViewports(renderingEngine, [
                    {
                        volumeId,
                        // callback: setCtTransferFunctionForVolumeActor,
                        blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                    },
                ],
                    [viewPID]
                );

                const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
                toolGroup.addViewport(viewPID, renderID);

                renderingEngine.renderViewports([viewPID]);
            } else {
                //Configuration et initialisation des libraries
                initCornerstoneWADOImageLoader();
                await init();
                await ToolInit();

                //On ajoute les outils souhaités
                addTool(ZoomTool);
                addTool(StackScrollMouseWheelTool);
                addTool(CrosshairsTool);

                volumeLoader.registerVolumeLoader('cornerStreamingImageVolume', cornerstoneStreamingImageVolumeLoader);
                let imageIds = []
                files.forEach(file => {
                    let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                    imageIds.push(imageId)
                });

                for (let imageId of imageIds) {
                    const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageId)
                    const fImage = await firstImage["promise"]
                }

                const volumeMetadata = makeVolumeMetadata(imageIds);

                const element1 = document.getElementById(view);

                element1.oncontextmenu = (e) => e.preventDefault();

                const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                    imageIds
                });

                console.log(volume)

                const renderingEngine = new RenderingEngine(renderID);

                const viewportInput = [{
                    viewportId: viewPID,
                    element: element1,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.AXIAL,
                        background: [0, 0, 0],
                    },
                }];

                renderingEngine.setViewports(viewportInput);

                volume.load();

                await setVolumesForViewports(renderingEngine, [
                    {
                        volumeId,
                        // callback: setCtTransferFunctionForVolumeActor,
                        blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                    },
                ],
                    [viewPID]
                );

                //Définition du groupe qui va contenir tout les outils
                const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

                //Ajout des outils au viewport
                toolGroup.addViewport(viewPID, renderID);
                console.log(toolGroup);

                // Tools
                toolGroup.addTool(ZoomTool.toolName)
                toolGroup.addTool(StackScrollMouseWheelTool.toolName);

                //De base sur la molette
                toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
                toolGroup.setToolActive(ZoomTool.toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Secondary }],
                });
                //The crosshairtool is set to active when the user clicks on the CrossHair button which is the component CoordsOnCursor
                renderingEngine.renderViewports([viewPID]);
            }

        }
        if (files.length > 0) {
            run();
        }
    }, [files])

    return (
        <>
            <div style={{ flexDirection: 'column' }}>
                <Drop set={buildImageId}></Drop>
                <div id='content'>
                    <div id='DivView' style={{ display: 'flex', flexDirection: 'row' }}>
                        <div id={view} style={{ width: '409px', height: '500px' }}></div>
                    </div>
                </div>
            </div>


        </>
    )
}