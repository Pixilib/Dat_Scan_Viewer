import React, { Component, useEffect, useState } from 'react';
import { CONSTANTS, cache, init, RenderingEngine, volumeLoader, Enums, metaData, setVolumesForViewports, getRenderingEngine, VolumeViewport, utilities as csCoreUti } from '@cornerstonejs/core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import initCornerstoneWADOImageLoader from './initCornerstoneWADOImageLoader'
import { cornerstoneStreamingImageVolumeLoader } from '@cornerstonejs/streaming-image-volume-loader';
import { makeVolumeMetadata } from '@cornerstonejs/streaming-image-volume-loader/dist/esm/helpers';
import { addTool, LengthTool, CrosshairsTool, ToolGroupManager, SegmentationDisplayTool, StackScrollMouseWheelTool, ZoomTool, init as ToolInit, BrushTool, RectangleScissorsTool, CircleScissorsTool, SphereScissorsTool, Enums as csEnums, utilities, RectangleROIThresholdTool, segmentation } from '@cornerstonejs/tools';
import { MouseBindings } from '@cornerstonejs/tools/dist/esm/enums';
import { getAnnotation } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationState'
import { getActiveSegmentationRepresentation } from '@cornerstonejs/tools/dist/esm/stateManagement/segmentation/activeSegmentation'
import { getSegmentationRepresentationByUID } from '@cornerstonejs/tools/dist/esm/stateManagement/segmentation/segmentationState'
import CoordsOnCursor from './tools/coordsOnCursor';
import Drop from './DropZone';
import RectangleRoiTreshold from './tools/rectangleRoiTreshold';
import { addSegmentationRepresentations } from '@cornerstonejs/tools/dist/esm/stateManagement/segmentation';
import $ from 'jquery'
import { getAnnotationSelected, getAnnotationsSelectedByToolName } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationSelection';
import { thresholdVolumeByRange } from '@cornerstonejs/tools/dist/esm/utilities/segmentation';

export default () => {
    const [files, setFiles] = useState([]);

    const renderingEngineId = 'myRenderingEngine';
    const toolGroupId = 'STACK_TOOL_GROUP_ID'
    const segmentationId = 'MY_SEGMENTATION_ID';
    const viewportId1 = 'CT_AXIAL';
    const viewportId2 = 'CT_SAGITTAL';
    const viewportId3 = 'CT_CORONAL';
    const volumeId = 'cornerStreamingImageVolume: myVolume';

    let lowerThreshold;
    let upperThreshold;
    let numSlicesToProject;

    let segmentationRepresentationByUID;

    const onClickRender = () => {
        const selectedAnnotationUIDs = getAnnotationsSelectedByToolName(RectangleROIThresholdTool.toolName);

        if (!selectedAnnotationUIDs) {
            throw new Error('No annotation selected ');
        }
        console.log(selectedAnnotationUIDs[0]);
        const annotationUID = selectedAnnotationUIDs[0]["annotationUID"];
        const annotation = getAnnotation(annotationUID);
        console.log(annotation);

        if (!annotation) {
            console.log('ici');
            return;
        }

        const { metadata } = annotation;
        console.log(selectedAnnotationUIDs[0]["metadata"][""]);
        // console.log(metadata.)
        const viewport = metadata.enableElement.viewport;
        const volumeActorInfo = viewport.getDefaultActor();

        const { uid } = volumeActorInfo;

        const referenceVolume = cache.getVolume(uid);

        const segmentationRepresentation = getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationByUID);

        const annotations = selectedAnnotationUIDs.map((annotationUID) => {
            const annotation = getAnnotation(annotationUID);
            return annotation;
        });


        thresholdVolumeByRange(annotations, [referenceVolume], segmentationRepresentation, {
            lowerThreshold, higherThreshold: upperThreshold, numSlicesToProject, overwrite: false,
        })

    }

    const onSelectedChangeSlices = () => {
        const inputVal = $('div #inputSlices').val();
        numSlicesToProject = inputVal;
        const labelName = $('div #labelSlices').text('Number of slices to Segment: ' + inputVal);
    }

    const onSelectedChangeInputLowerT = () => {
        const inputVal = $('div #inputLowerT').val();
        lowerThreshold = inputVal;
        const labelName = $('div #labelLowerT').text('Lower Threshold: ' + inputVal);
    }

    const onSelectedChangeInputUpperT = () => {
        const inputVal = $('div #inputUpperT').val();
        upperThreshold = inputVal;
        const labelName = $('div #labelUpperT').text('Upper Threshold: ' + inputVal);
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
            initCornerstoneWADOImageLoader();
            await init();
            await ToolInit();

            //On ajoute les outils souhaités
            addTool(ZoomTool);
            addTool(StackScrollMouseWheelTool);
            addTool(CrosshairsTool)
            addTool(SegmentationDisplayTool)
            addTool(RectangleROIThresholdTool)

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

            await addSegmentationsToState();

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
            toolGroup.addTool(SegmentationDisplayTool.toolName);
            toolGroup.addTool(RectangleROIThresholdTool.toolName);
            toolGroup.addTool(CrosshairsTool.toolName, {
                getReferenceLineColor,
                getReferenceLineControllable,
                getReferenceLineDraggableRotatable,
                getReferenceLineSlabThicknessControlsOn,
            });

            toolGroup.setToolEnabled(SegmentationDisplayTool.toolName);

            //De base sur la molette
            toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
            toolGroup.setToolActive(RectangleROIThresholdTool.toolName, {
                bindings: [{ mouseButton: MouseBindings.Primary }],
            });
            toolGroup.setToolActive(ZoomTool.toolName, {
                bindings: [{ mouseButton: MouseBindings.Secondary }],
            });
            //The crosshairtool is set to active when the user clicks on the CrossHair button which is the component CoordsOnCursor

            // // Add the segmentation representation to the toolgroup
            const segmentationRepresentationByUIDs =
                await addSegmentationRepresentations(toolGroupId, [
                    {
                        segmentationId,
                        type: csEnums.SegmentationRepresentations.Labelmap,
                    },
                ]);

            segmentationRepresentationByUID = segmentationRepresentationByUIDs[0];

            const viewp1 = renderingEngine.getViewport(viewportId1)
            const viewp1Data = viewp1.getImageData();
            // console.log('Matrice point VP1', viewp1Data['imageData'].getPointData().getArrays()[0].getData());
            console.log(viewp1Data['imageData'].getPointData().getArrays()[0]);
            console.log('Matrice point VP1', viewp1Data['imageData'].getPointData().getArrays()[0].get());


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
                {/* <RectangleRoiTreshold toolgroupId={toolGroupId}></RectangleRoiTreshold> */}
                <CoordsOnCursor renderingEngineId={renderingEngineId} viewportId1={viewportId1} viewportId2={viewportId2} viewportId3={viewportId3} toolGroupId={toolGroupId} volumeId={volumeId}></CoordsOnCursor>
            </div>
            <div id='content'>
                <div id='DivView' style={{ display: 'flex', flexDirection: 'row' }}>
                    <div id='view1' style={{ width: '409px', height: '500px' }}></div>
                    <div id='view2' style={{ width: '409px', height: '500px' }}></div>
                    <div id='view3' style={{ width: '409px', height: '500px' }}></div>
                </div>
            </div>
            <div style={{ color: 'white' }}>
                <button onClick={onClickRender}>Execute threshold</button>
                <label id="labelSlices">Number of slices to Segment: 3</label>
                <input id='inputSlices' type='range' min='1' max='5' defaultValue='3' onChange={onSelectedChangeSlices}></input>

                <label id="labelLowerT">Lower Threshold: 100</label>
                <input id='inputLowerT' type='range' min='100' max='400' defaultValue='100' onChange={onSelectedChangeInputLowerT}></input>

                <label id="labelUpperT">Upper Threshold: 500</label>
                <input id='inputUpperT' type='range' min='500' max='1000' defaultValue='500' onChange={onSelectedChangeInputUpperT}></input>
            </div>
        </>
    )
}