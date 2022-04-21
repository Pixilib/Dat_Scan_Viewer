import React, { Component, useEffect, useState } from 'react';
import { CONSTANTS, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports, getRenderingEngine, VolumeViewport, utilities as csCoreUti } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';
import { addTool, LengthTool, CrosshairsTool, ToolGroupManager, SegmentationDisplayTool, StackScrollMouseWheelTool, segmentation, ZoomTool, init as ToolInit, BrushTool, RectangleScissorsTool, CircleScissorsTool, SphereScissorsTool, Enums as csEnums, utilities } from '@cornerstonejs/tools';
import { MouseBindings } from '@cornerstonejs/tools/dist/esm/enums';
import CoordsOnCursor from './tools/coordsOnCursor';
import Drop from './DropZone';

export default () => {
    const [files, setFiles] = useState([]);

    const renderingEngineId = 'myRenderingEngine';
    const toolGroupId = 'STACK_TOOL_GROUP_ID'
    const segmentationId = 'MY_SEGMENTATION_ID';
    const viewportId1 = 'CT_AXIAL';
    const viewportId2 = 'CT_SAGITTAL';
    const viewportId3 = 'CT_CORONAL';
    const volumeId = 'cornerStreamingImageVolume: myVolume';

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
            await init();

            //On ajoute les outils souhaités
            addTool(ZoomTool);
            addTool(StackScrollMouseWheelTool);
            addTool(CrosshairsTool)

            await ToolInit();

            initCornerstoneWADOImageLoader();

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
            const element2 = document.getElementById('view2');
            const element3 = document.getElementById('view3');

            element1.oncontextmenu = (e) => e.preventDefault();
            element2.oncontextmenu = (e) => e.preventDefault();
            element3.oncontextmenu = (e) => e.preventDefault();

            const volume = await volumeLoader.createAndCacheVolume(volumeId, {
                imageIds
            });

            const renderingEngine = new RenderingEngine(renderingEngineId)

            const viewportInput = [{
                viewportId: viewportId1,
                element: element1,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.AXIAL,
                    background: [0, 0, 0],
                },
            },
            {
                viewportId: viewportId2,
                element: element2,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.SAGITTAL,
                    background: [0, 0, 0],
                },
            },
            {
                viewportId: viewportId3,
                element: element3,
                type: Enums.ViewportType.ORTHOGRAPHIC,
                defaultOptions: {
                    orientation: CONSTANTS.ORIENTATION.CORONAL,
                    background: [0, 0, 0],
                },
            }];

            renderingEngine.setViewports(viewportInput);

            await addSegmentationsToState();

            volume.load();

            await setVolumesForViewports(renderingEngine, [
                {
                    volumeId,
                    // callback: setCtTransferFunctionForVolumeActor,
                    blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND
                },
            ],
                [viewportId1, viewportId2, viewportId3]
            );

            //Définition du groupe qui va contenir tout les outils
            const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
            console.log(toolGroup)

            //Ajout des outils au viewport
            toolGroup.addViewport(viewportId1, renderingEngineId);
            toolGroup.addViewport(viewportId2, renderingEngineId);
            toolGroup.addViewport(viewportId3, renderingEngineId);

            // Tools
            toolGroup.addTool(ZoomTool.toolName)
            toolGroup.addTool(StackScrollMouseWheelTool.toolName);
            toolGroup.addTool(CrosshairsTool.toolName, {
                getReferenceLineColor,
                getReferenceLineControllable,
                getReferenceLineDraggableRotatable,
                getReferenceLineSlabThicknessControlsOn,
            });

            //De base sur la molette
            toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
            toolGroup.setToolActive(ZoomTool.toolName, {
                bindings: [{ mouseButton: MouseBindings.Secondary }],
            });
            //The crosshairtool is set to active when the user clicks on the CrossHair button which is the component CoordsOnCursor

            const viewp1 = renderingEngine.getViewport(viewportId1)
            const viewp1Data = viewp1.getImageData();
            // console.log('Matrice point VP1', viewp1Data['imageData'].getPointData().getArrays()[0].getData());


            const viewp2 = renderingEngine.getViewport(viewportId2)
            const viewp2Data = viewp2.getImageData();
            // console.log('Matrice point VP2', viewp2Data['imageData'].getPointData().getArrays()[0].getData());

            renderingEngine.renderViewports([viewportId1, viewportId2, viewportId3]);

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
                <CoordsOnCursor renderingEngineId={renderingEngineId} viewportId1={viewportId1} viewportId2={viewportId2} viewportId3={viewportId3} toolGroupId={toolGroupId}></CoordsOnCursor>
            </div>
            <div id='content'>
                <div id='DivView' style={{ display: 'flex', flexDirection: 'row' }}>
                    <div id='view1' style={{ width: '409px', height: '500px' }}></div>
                    <div id='view2' style={{ width: '409px', height: '500px' }}></div>
                    <div id='view3' style={{ width: '409px', height: '500px' }}></div>
                </div>
            </div>
        </>
    )
}