import { cache, getRenderingEngine, RenderingEngine } from '@cornerstonejs/core'
import { RectangleROIThresholdTool, utilities } from '@cornerstonejs/tools'
import { getAnnotationsSelectedByToolName } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationSelection'
import { getAnnotation } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationState'
import { getSegmentationRepresentationByUID } from '@cornerstonejs/tools/dist/esm/stateManagement/segmentation/segmentationState'
import { thresholdVolumeByRange } from '@cornerstonejs/tools/dist/esm/utilities/segmentation'
import $ from 'jquery'


export default ({ toolGroupId, renderingEngineId, viewportId1, viewportId2, viewportId3, segUID }) => {
    let lowerThreshold;
    let upperThreshold;
    let numSlicesToProject;

    let viewPID;
    let elementView1;
    let elementView2;
    let elementView3;

    let segmentationRepresentationByUID;
    const toolGid = toolGroupId;

    const onClickInit = async () => {

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
        document.getElementById('tool').style = "visibility: 'visible'";
        document.getElementById('buttonTool').hidden = true;
    }

    const onClickRender = () => {
        let viewP;
        const renderingEngine = getRenderingEngine(renderingEngineId)
        viewP = renderingEngine.getViewport(viewPID);
        console.log(viewPID)

        const selectedAnnotationUIDs = getAnnotationsSelectedByToolName(RectangleROIThresholdTool.toolName);

        if (!selectedAnnotationUIDs) {
            throw new Error('No annotation selected ');
        }
        console.log(selectedAnnotationUIDs);
        const annotationUID = selectedAnnotationUIDs[0]["annotationUID"];
        const annotation = getAnnotation(annotationUID);

        if (!annotation) {
            console.log('ici');
            return;
        }
        console.log(viewP)
        const viewport = viewP;
        const volumeActorInfo = viewport.getDefaultActor();

        const { uid } = volumeActorInfo;

        const referenceVolume = cache.getVolume(uid);

        console.log(segUID)
        const segmentationRepresentation = getSegmentationRepresentationByUID(toolGroupId, segUID);

        console.log(segmentationRepresentation)
        // const annotations = selectedAnnotationUIDs.map((annotationUID) => {
        //     const annotation = getAnnotation(annotationUID);
        //     return annotation;
        // });

        console.log(toolGroupId)

        thresholdVolumeByRange([annotation], [referenceVolume], segmentationRepresentation, {
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


    return (<>
        <button id='buttonTool' onClick={onClickInit}>RectangleRoiTreshold</button>
        <div id='tool' style={{ color: 'white', visibility: 'hidden' }}>
            <button onClick={onClickRender}>Execute threshold</button>
            <label id="labelSlices">Number of slices to Segment: 3</label>
            <input id='inputSlices' type='range' min='1' max='5' defaultValue='3' onChange={onSelectedChangeSlices}></input>

            <label id="labelLowerT">Lower Threshold: 100</label>
            <input id='inputLowerT' type='range' min='100' max='400' defaultValue='100' onChange={onSelectedChangeInputLowerT}></input>

            <label id="labelUpperT">Upper Threshold: 500</label>
            <input id='inputUpperT' type='range' min='500' max='1000' defaultValue='500' onChange={onSelectedChangeInputUpperT}></input>
        </div>

    </>)
}