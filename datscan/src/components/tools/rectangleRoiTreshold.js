import { cache, getRenderingEngine } from '@cornerstonejs/core'
import { RectangleROIThresholdTool, Enums as csEnums, ToolGroupManager, annotation as Anno, segmentation, utilities as CsToolsUtils } from '@cornerstonejs/tools'
import $ from 'jquery'


export default ({ toolGroupId, renderingEngineId, viewportId1, viewportId2, viewportId3 }) => {
    let lowerThreshold;
    let upperThreshold;
    let numSlicesToProject;

    let viewPID;
    let elementView1;
    let elementView2;
    let elementView3;

    let segmentationRepresentationByUID;

    const onClickInit = () => {

        elementView1 = document.getElementById('view1');
        elementView2 = document.getElementById('view2');
        elementView3 = document.getElementById('view3');

        elementView1.addEventListener('mousedown', () => {
            viewPID = viewportId1;
        })

        elementView2.addEventListener('mousedown', () => {
            viewPID = viewportId2;
        })

        elementView3.addEventListener('mousedown', () => {
            viewPID = viewportId3;
        })
        document.getElementById('RectangleROItooldiv').style = "visibility: 'visible'";
        document.getElementById('RectangleROIbuttonTool').hidden = true;


        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        const activeTool = toolGroup.getActivePrimaryMouseButtonTool();

        if (activeTool != null) {
            toolGroup.setToolDisabled(activeTool);
            document.getElementById('CrossHairUI').hidden = true;
            document.getElementById('RectangleROItooldiv').hidden = false;
        }

        toolGroup.setToolActive(RectangleROIThresholdTool.toolName, {
            bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
        });
    }

    const onClickRender = async () => {
        let viewP;
        const renderingEngine = getRenderingEngine(renderingEngineId)
        viewP = renderingEngine.getViewport(viewPID);

        const selectedAnnotationUIDs = Anno.selection.getAnnotationsSelectedByToolName(RectangleROIThresholdTool.toolName);

        if (!selectedAnnotationUIDs) {
            throw new Error('No annotation selected ');
        }

        console.log(selectedAnnotationUIDs);
        const annotationUID = selectedAnnotationUIDs[0]["annotationUID"];
        const annotation = Anno.state.getAnnotation(annotationUID);

        if (!annotation) {
            console.log('ici');
            return;
        }

        const viewport = viewP;
        const volumeActorInfo = viewport.getDefaultActor();
        const volume = cache.getVolume(volumeActorInfo.uid);

        console.log('4 coins :', annotation.data.handles.points);
        // console.log(volume.spacing)

        const { uid } = volumeActorInfo;

        const segmentationId = 'MY_SEGMENTATION_ID';

        const segmentationRepresentationByUIDs =
            await segmentation.addSegmentationRepresentations(toolGroupId, [
                {
                    segmentationId,
                    type: csEnums.SegmentationRepresentations.Labelmap,
                },
            ]);

        segmentationRepresentationByUID = segmentationRepresentationByUIDs[0];
        console.log(segmentationRepresentationByUID);

        const referenceVolume = cache.getVolume(uid);

        const segmentationRepresentation = segmentation.state.getSegmentationRepresentationByUID(toolGroupId, segmentationRepresentationByUID);
        console.log(segmentationRepresentation.type)

        const img = CsToolsUtils.segmentation.thresholdVolumeByRange([annotation], [referenceVolume], segmentationRepresentation, {
            lowerThreshold, higherThreshold: upperThreshold, numSlicesToProject, overwrite: false,
        })

        console.log('Segmentation config :', segmentation.state.getSegmentation(segmentationId))

        // console.log('Volume segmentation :', img);
        console.log('Volume segmentation :', img.scalarData);
        const segScalar = Array.prototype.slice.call(img.scalarData);
        console.log(typeof segScalar)
        const result = segScalar.flat().reduce((a, b) => a + b);
        console.log(result);
        // console.log('Volume segmentation :', img.imageData.getBounds());
        // console.log('--------------------------------------')
        // console.log('Volume image de base', volume)
        console.log('Volume image de base ', volume.scalarData)

        console.log('selection :', segmentationRepresentation);
        // console.log('actors :', viewP._actors.get(segmentationRepresentationByUID));
        // const actor = viewP._actors.get(segmentationRepresentationByUID);
        // console.log(actor.volumeActor.get().mapper.get());
        // console.log(actor.volumeActor.getVolumes().getBounds());

        // let PointMatrix = [];
        const corners = annotation.data.handles.points;

        const spacingX = volume.spacing[1]
        const z = corners[0][0];
        const pointHightLeftX = corners[0][1];
        const pointHightRightX = corners[1][1];
        const pointBottomLeftX = corners[2][1];
        const pointBottomRightX = corners[3][1];

        const spacingY = volume.spacing[2]
        const pointHightLeftY = corners[0][2];
        const pointHightRighY = corners[1][2];
        const pointBottomLeftY = corners[2][2];
        const pointBottomRightY = corners[3][2];

        // for (let i = pointHightLeftY; i > pointBottomLeftY; i - spacingY) {
        //     console.log('i :', i)
        //     for (let j = pointBottomLeftX; j < pointBottomRightX; j + spacingX) {
        //         console.log('j :', j)
        //         PointMatrix.push([z, j, i]);
        //     }
        // }

        // Bad method but working(I think)
        // let i = pointHightLeftY;
        // let j = pointBottomLeftX;
        // while (i > pointBottomLeftY) {
        //     while (j < pointBottomRightX) {
        //         PointMatrix.push([z, i, j]);
        //         j = j + spacingX;
        //     }
        //     j = pointBottomLeftX;
        //     i = i - spacingY;
        // }
        // console.log(PointMatrix);

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


    return (<>
        <button id='RectangleROIbuttonTool' onClick={onClickInit}>RectangleRoiTreshold</button>
        <div id='RectangleROItooldiv' style={{ visibility: 'hidden' }}>
            <div style={{ color: 'white' }}>
                <button onClick={onClickRender}>Execute threshold</button>
                <label id="labelSlices">Number of slices to Segment: 3</label>
                <input id='inputSlices' type='range' min='1' max='5' defaultValue='3' onChange={onSelectedChangeSlices}></input>

                <label id="labelLowerT">Lower Threshold: 100</label>
                <input id='inputLowerT' type='range' min='-1024' max='400' defaultValue='100' onChange={onSelectedChangeInputLowerT}></input>

                <label id="labelUpperT">Upper Threshold: 500</label>
                <input id='inputUpperT' type='range' min='500' max='1024' defaultValue='500' onChange={onSelectedChangeInputUpperT}></input></div>
        </div>

    </>)
}