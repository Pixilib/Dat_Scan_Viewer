import { cache, RenderingEngine } from '@cornerstonejs/core'
import { RectangleROIThresholdTool, utilities } from '@cornerstonejs/tools'
import { getAnnotation } from '@cornerstonejs/tools/dist/esm/stateManagement/annotation/annotationState'
import { getActiveSegmentationRepresentation } from '@cornerstonejs/tools/dist/esm/stateManagement/segmentation/activeSegmentation'
import { getSegmentationRepresentationByUID } from '@cornerstonejs/tools/dist/esm/stateManagement/segmentation/segmentationState'
import $ from 'jquery'


export default ({ toolgroupId }) => {
    let segmentationRepresentationByUID;
    let lowerThreshold;
    let upperThreshold;
    let numSlicesToProject;

    const onClickRender = () => {
        const selectedAnnotationUIDs = getActiveSegmentationRepresentation(RectangleROIThresholdTool.toolName);

        if (!selectedAnnotationUIDs) {
            throw new Error('No annotation selected ');
        }

        const annotationUID = selectedAnnotationUIDs[0];
        const annotation = getAnnotation(annotationUID);

        if (!annotation) {
            return;
        }
        const viewport = annotation.enableElement.viewport;
        const volumeActorInfo = viewport.getDefaultActor();

        const referenceVolume = cache.getVolume(volumeActorInfo);

        const segmentationRepresentation = getSegmentationRepresentationByUID(toolgroupId, segmentationRepresentationByUID);

        const annotations = selectedAnnotationUIDs.map((annotationUID) => {
            const annotation = getAnnotation(annotationUID);
            return annotation;
        });

        utilities.segmentation.thresholdVolumeByRange(annotations, [referenceVolume], segmentationRepresentation, {
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
        <div style={{ color: 'white' }}>
            <button>Execute threshold</button>
            <label id="labelSlices">Number of slices to Segment: 3</label>
            <input id='inputSlices' type='range' min='1' max='5' defaultValue='3' onChange={onSelectedChangeSlices}></input>

            <label id="labelLowerT">Lower Threshold: 100</label>
            <input id='inputLowerT' type='range' min='100' max='400' defaultValue='100' onChange={onSelectedChangeInputLowerT}></input>

            <label id="labelUpperT">Upper Threshold: 500</label>
            <input id='inputUpperT' type='range' min='500' max='1000' defaultValue='500' onChange={onSelectedChangeInputUpperT}></input>
        </div>

    </>)
}