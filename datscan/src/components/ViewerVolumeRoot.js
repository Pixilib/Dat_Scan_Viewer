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


export default ({ view, view2, view3, renderID, viewPID, viewPID2, viewPID3, toolGroupId }) => {


    const viewportColors = {
        [viewPID]: 'rgb(200, 0, 0)',
        [viewPID2]: 'rgb(200, 200, 0)',
        [viewPID3]: 'rgb(0, 200, 0)',
    };

    const viewportReferenceLineControllable = [
        viewPID,
        viewPID2,
        viewPID3,
    ];

    const viewportReferenceLineDraggableRotatable = [
        viewPID,
        viewPID2,
        viewPID3,
    ];

    const viewportReferenceLineSlabThicknessControlsOn = [
        viewPID,
        viewPID2,
        viewPID3,
    ];

    function getReferenceLineColor(viewportId) {
        return viewportColors[viewportId];
    };

    function getReferenceLineControllable(viewportId) {
        const index = viewportReferenceLineControllable.indexOf(viewportId);
        return index !== -1;
    };

    function getReferenceLineDraggableRotatable(viewportId) {
        const index = viewportReferenceLineDraggableRotatable.indexOf(viewportId);
        return index !== -1;
    };

    function getReferenceLineSlabThicknessControlsOn(viewportId) {
        const index =
            viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
        return index !== -1;
    };

    const [files, setFiles] = useState([]);
    let volumeId = 'cornerStreamingImageVolume: myVolume';

    const buildImageId = (files) => {
        setFiles(files)

    }

    useEffect(() => {

        const run = async () => {
            if (ToolGroupManager.getToolGroup('ToolGroupID1') != null) {

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

                const element2 = document.getElementById(view2);
                element2.oncontextmenu = (e) => e.preventDefault();

                const element3 = document.getElementById(view3);
                element3.oncontextmenu = (e) => e.preventDefault();

                volumeId = 'cornerStreamingImageVolume: myVolumetwo';

                const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                    imageIds
                });

                const renderingEngine = new RenderingEngine(renderID);

                const viewportInput = [{
                    viewportId: viewPID,
                    element: element1,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.AXIAL,
                        background: [0, 0, 0],
                    },
                },
                {
                    viewportId: viewPID2,
                    element: element2,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                        background: [0, 0, 0],
                    },
                },
                {
                    viewportId: viewPID3,
                    element: element3,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.CORONAL,
                        background: [0, 0, 0],
                    },
                }];

                renderingEngine.setViewports(viewportInput);

                volume.load();

                console.log(cache);

                await setVolumesForViewports(renderingEngine, [
                    {
                        volumeId,
                        // callback: setCtTransferFunctionForVolumeActor,
                        blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                    },
                ],
                    [viewPID, viewPID2, viewPID3]
                );

                //Définition du groupe qui va contenir tout les outils
                const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

                //Ajout des outils au viewport 
                toolGroup.addViewport(viewPID, renderID);
                toolGroup.addViewport(viewPID2, renderID);
                toolGroup.addViewport(viewPID3, renderID);
                console.log(toolGroup);

                // Tools
                toolGroup.addTool(ZoomTool.toolName)
                toolGroup.addTool(StackScrollMouseWheelTool.toolName);
                // toolGroup.addTool(CrosshairsTool.toolName, {
                //     getReferenceLineColor,
                //     getReferenceLineControllable,
                //     getReferenceLineDraggableRotatable,
                //     getReferenceLineSlabThicknessControlsOn,
                // });

                //De base sur la molette
                toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
                toolGroup.setToolActive(ZoomTool.toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Secondary }],
                });
                // toolGroup.setToolEnabled(CrosshairsTool.toolName);
                // toolGroup.setToolActive(CrosshairsTool.toolName, {
                //     bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
                // });

                renderingEngine.renderViewports([viewPID, viewPID2, viewPID3]);
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

                const element2 = document.getElementById(view2);
                element2.oncontextmenu = (e) => e.preventDefault();

                const element3 = document.getElementById(view3);
                element3.oncontextmenu = (e) => e.preventDefault();

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
                },
                {
                    viewportId: viewPID2,
                    element: element2,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                        background: [0, 0, 0],
                    },
                },
                {
                    viewportId: viewPID3,
                    element: element3,
                    type: Enums.ViewportType.ORTHOGRAPHIC,
                    defaultOptions: {
                        orientation: CONSTANTS.ORIENTATION.CORONAL,
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
                    [viewPID, viewPID2, viewPID3]
                );

                //Définition du groupe qui va contenir tout les outils
                const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

                //Ajout des outils au viewport
                toolGroup.addViewport(viewPID, renderID);
                toolGroup.addViewport(viewPID2, renderID);
                toolGroup.addViewport(viewPID3, renderID);
                console.log(toolGroup);

                // Tools
                toolGroup.addTool(ZoomTool.toolName)
                toolGroup.addTool(StackScrollMouseWheelTool.toolName);
                // toolGroup.addTool(CrosshairsTool.toolName, {
                //     getReferenceLineColor,
                //     getReferenceLineControllable,
                //     getReferenceLineDraggableRotatable,
                //     getReferenceLineSlabThicknessControlsOn,
                // });

                //De base sur la molette
                toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
                toolGroup.setToolActive(ZoomTool.toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Secondary }],
                });

                // toolGroup.setToolEnabled(CrosshairsTool.toolName);
                // toolGroup.setToolActive(CrosshairsTool.toolName, {
                //     bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
                // });
                //The crosshairtool is set to active when the user clicks on the CrossHair button which is the component CoordsOnCursor
                renderingEngine.renderViewports([viewPID, viewPID2, viewPID3]);
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
                        <div id={view2} style={{ width: '409px', height: '500px' }}></div>
                        <div id={view3} style={{ width: '409px', height: '500px' }}></div>
                    </div>
                </div>
            </div>


        </>
    )
}