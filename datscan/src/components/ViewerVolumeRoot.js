import { CONSTANTS, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports, getRenderingEngine, VolumeViewport } from '@cornerstonejs/core';
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
import { addTool, LengthTool, CrosshairsTool, ToolGroupManager, SegmentationDisplayTool, StackScrollMouseWheelTool, segmentation, ZoomTool, init as ToolInit, BrushTool, RectangleScissorsTool, CircleScissorsTool, SphereScissorsTool, Enums as csEnums } from '@cornerstonejs/tools';
import { MouseBindings } from '@cornerstonejs/tools/dist/esm/enums';
import ListSegmentation from './tools/ListSegmentation';
import CrossHair from './tools/CrossHair';
import setCtTransferFunctionForVolumeActor from './setCtTransferFunctionForVolumeActor';

export default () => {
    const [files, setFiles] = useState([]);

    const renderingEngineId = 'myRenderingEngine';
    const toolGroupId = 'STACK_TOOL_GROUP_ID'
    const segmentationId = 'MY_SEGMENTATION_ID';
    const viewportId1 = 'CT_AXIAL';
    const viewportId2 = 'CT_SAGITTAL';
    const viewportId3 = 'CT_CORONAL';
    const volumeId = 'cornerStreamingImageVolume: myVolume';

    const buildImageId = (files) => {
        setFiles(files)

    }

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
            await ToolInit();
            initCornerstoneWADOImageLoader();

            //On ajoute les outils souhaités
            // addTool(LengthTool);
            addTool(ZoomTool);
            addTool(StackScrollMouseWheelTool);
            addTool(SegmentationDisplayTool);
            addTool(RectangleScissorsTool);
            addTool(CircleScissorsTool);
            addTool(SphereScissorsTool);
            addTool(BrushTool);
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


            const divContent = document.getElementById("content");
            const divViewports = document.createElement("div");
            divViewports.style.display = 'flex';
            divViewports.style.flexDirection = 'row';

            const element1 = document.createElement('div');
            const element2 = document.createElement('div');
            const element3 = document.createElement('div');

            element1.style.width = '500px';
            element1.style.height = '500px';
            element2.style.width = '500px';
            element2.style.height = '500px';
            element3.style.width = '500px';
            element3.style.height = '500px';

            element1.oncontextmenu = (e) => e.preventDefault();
            element2.oncontextmenu = (e) => e.preventDefault();
            element3.oncontextmenu = (e) => e.preventDefault();

            divViewports.appendChild(element1);
            divViewports.appendChild(element2);
            divViewports.appendChild(element3);

            divContent.appendChild(divViewports);

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

            //Ajout des outils au viewport
            toolGroup.addViewport(viewportId1, renderingEngineId);
            toolGroup.addViewport(viewportId2, renderingEngineId);
            toolGroup.addViewport(viewportId3, renderingEngineId);

            // // Segmentation Tools
            toolGroup.addTool(SegmentationDisplayTool.toolName);
            toolGroup.addTool(RectangleScissorsTool.toolName);
            toolGroup.addTool(CircleScissorsTool.toolName);
            toolGroup.addTool(SphereScissorsTool.toolName);
            toolGroup.addTool(BrushTool.toolName);
            toolGroup.addTool(ZoomTool.toolName)
            toolGroup.setToolEnabled(SegmentationDisplayTool.toolName);


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
            toolGroup.setToolActive(CrosshairsTool.toolName, {
                bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
            });

            await segmentation.addSegmentationRepresentations(toolGroupId, [
                {
                    segmentationId,
                    type: csEnums.SegmentationRepresentations.Labelmap,
                },
            ]);

            const viewp1 = renderingEngine.getViewport(viewportId1)
            console.log("Viewport 1 : ", viewp1)
            const viewp1Data = viewp1.getImageData();
            console.log(viewp1Data['imageData']);
            console.log(viewp1Data['imageData'].getNumberOfCells());
            console.log(viewp1Data['imageData'].getNumberOfPoints());
            console.log(viewp1Data['imageData'].getPointData().getArrays()[0].getData());


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
                {/* <FlipVerticalButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></FlipVerticalButton> */}
                {/* <FlipHorizontalButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></FlipHorizontalButton> */}
                {/* <ListOrientation renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></ListOrientation> */}
                {/* <ResetButton renderingEngineId={renderingEngineId} viewportId={viewportIdentifiant}></ResetButton> */}
                <ListSegmentation toolGroupId={toolGroupId}></ListSegmentation>
                {/* <CrossHair toolGroupId={toolGroupId} vId1={viewportId1} vId2={viewportId2} vId3={viewportId3}></CrossHair> */}
            </div>
            <div id='content'></div>
        </>
    )
}