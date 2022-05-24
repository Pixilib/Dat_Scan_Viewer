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


export default () => {
    const [files, setFiles] = useState([]);
    const [files2, setFiles2] = useState([]);

    const renderingEngineId = 'myRenderingEngine';
    const renderingEngineId2 = 'myRenderingEngine2';
    const toolGroupId = 'STACK_TOOL_GROUP_ID'
    const segmentationId = 'MY_SEGMENTATION_ID';
    const viewportId1 = 'Viewport1';
    const viewportId2 = 'Viewport2';
    const viewportId3 = 'CT_CORONAL';
    let volumeId = 'cornerStreamingImageVolume: myVolume';


    const viewportColors = {
        [viewportId1]: 'rgb(200, 0, 0)',
        [viewportId2]: 'rgb(200, 200, 0)',
        [viewportId3]: 'rgb(0, 200, 0)',
    };

    const viewportReferenceLineControllable = [
        viewportId1,
        viewportId2,
        viewportId3,
    ];

    const viewportReferenceLineDraggableRotatable = [
        viewportId1,
        viewportId2,
        viewportId3,
    ];

    const viewportReferenceLineSlabThicknessControlsOn = [
        viewportId1,
        viewportId2,
        viewportId3,
    ];

    function getReferenceLineColor(viewportId) {
        return viewportColors[viewportId];
    }

    function getReferenceLineControllable(viewportId) {
        const index = viewportReferenceLineControllable.indexOf(viewportId);
        return index !== -1;
    }

    function getReferenceLineDraggableRotatable(viewportId) {
        const index = viewportReferenceLineDraggableRotatable.indexOf(viewportId);
        return index !== -1;
    }

    function getReferenceLineSlabThicknessControlsOn(viewportId) {
        const index =
            viewportReferenceLineSlabThicknessControlsOn.indexOf(viewportId);
        return index !== -1;
    }

    const buildImageId = (files) => {
        setFiles(files)

    }

    const buildImageId2 = (files) => {
        setFiles2(files)

    }

    async function addSegmentationsToState() {
        // Create a segmentation of the same resolution as the source data
        // using volumeLoader.createAndCacheDerivedVolume.
        await volumeLoader.createAndCacheDerivedVolume(volumeId, {
            volumeId: segmentationId,
        });

        // Add the segmentations to state
        segmentation.addSegmentations([
            {
                segmentationId,
                representation: {
                    // The type of segmentation
                    type: csEnums.SegmentationRepresentations.Labelmap,
                    // The actual segmentation data, in the case of labelmap this is a
                    // reference to the source volume of the segmentation.
                    data: {
                        volumeId: segmentationId,
                    },
                },
            },
        ]);
    }

    useEffect(() => {

        const run = async () => {
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

            const element1 = document.getElementById('view1');

            element1.oncontextmenu = (e) => e.preventDefault();

            const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                imageIds
            });

            console.log(volume)

            const renderingEngine = new RenderingEngine(renderingEngineId)

            const viewportInput = [{
                viewportId: viewportId1,
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
                [viewportId1]
            );

            //Définition du groupe qui va contenir tout les outils
            const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
            console.log(toolGroup)

            //Ajout des outils au viewport
            toolGroup.addViewport(viewportId1, renderingEngineId);

            // Tools
            toolGroup.addTool(ZoomTool.toolName)
            toolGroup.addTool(StackScrollMouseWheelTool.toolName);
            toolGroup.addTool(CrosshairsTool.toolName, {
                getReferenceLineColor,
                getReferenceLineControllable,
                getReferenceLineDraggableRotatable,
                getReferenceLineSlabThicknessControlsOn,
            });

            // toolGroup.setToolEnabled(CrosshairsTool.toolName);

            //De base sur la molette
            toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
            // toolGroup.setToolActive(ZoomTool.toolName, {
            //     bindings: [{ mouseButton: csEnums.MouseBindings.Secondary }],
            // });
            //The crosshairtool is set to active when the user clicks on the CrossHair button which is the component CoordsOnCursor

            renderingEngine.renderViewports([viewportId1]);

        }
        if (files.length > 0) {
            document.getElementById('toolbar').hidden = false
            run();
        } else {
            document.getElementById('toolbar').hidden = true
        }

    }, [files])

    useEffect(() => {

        const run2 = async () => {

            let imageIds = []
            files2.forEach(file => {
                let imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
                imageIds.push(imageId)
            });

            for (let imageId of imageIds) {
                const firstImage = cornerstoneWADOImageLoader.wadouri.loadImage(imageId)
                const fImage = await firstImage["promise"]
            }

            const volumeMetadata = makeVolumeMetadata(imageIds);
            const element2 = document.getElementById('view2');

            element2.oncontextmenu = (e) => e.preventDefault();

            volumeId = 'cornerStreamingImageVolume: myVolumetwo';

            const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                imageIds
            });

            const renderingEngine = new RenderingEngine(renderingEngineId2)
            const viewportInput = [{
                viewportId: viewportId2,
                element: element2,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.AXIAL,
                    background: [0, 0, 0],
                },
            }];

            renderingEngine.setViewports(viewportInput);

            const viewport = renderingEngine.getViewport(viewportId2);

            volume.load();

            console.log(cache);

            await setVolumesForViewports(renderingEngine, [
                {
                    volumeId,
                    // callback: setCtTransferFunctionForVolumeActor,
                    blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                },
            ],
                [viewportId2]
            );

            renderingEngine.renderViewports([viewportId2]);

        }
        if (files2.length > 0) {
            document.getElementById('toolbar').hidden = false
            run2();
        } else {
            document.getElementById('toolbar').hidden = true
        }

    }, [files2])

    return (
        <>
            <h1>DatScan Viewer / Volume Viewport</h1>
            <Drop set={buildImageId}></Drop>
            <Drop set={buildImageId2}></Drop>
            <div id='toolbar' style={{ marginTop: '10px', marginBottom: '5px' }}>
                {/* <RectangleRoiTreshold renderingEngineId={renderingEngineId} viewportId1={viewportId1} viewportId2={viewportId2} viewportId3={viewportId3} toolGroupId={toolGroupId}></RectangleRoiTreshold>
                <CoordsOnCursor renderingEngineId={renderingEngineId} viewportId1={viewportId1} viewportId2={viewportId2} viewportId3={viewportId3} toolGroupId={toolGroupId} volumeId={volumeId}></CoordsOnCursor>
                <ListOrientation renderingEngineId={renderingEngineId} viewportId={viewportId2}></ListOrientation> */}
                <GaeloCrosshair renderingEngineId1={renderingEngineId} renderingEngineId2={renderingEngineId2} viewportId1={viewportId1} viewportId2={viewportId2}></GaeloCrosshair>
            </div>
            <div id='content'>
                <div id='DivView' style={{ display: 'flex', flexDirection: 'row' }}>
                    <div id='view1' style={{ width: '409px', height: '500px' }}></div>
                    <div id='view2' style={{ width: '409px', height: '500px' }}></div>
                </div>
            </div>

        </>
    )
}