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
        console.log(viewPID)

        const selectedAnnotationUIDs = Anno.selection.getAnnotationsSelectedByToolName(RectangleROIThresholdTool.toolName);

        if (!selectedAnnotationUIDs) {
            throw new Error('No annotation selected ');
        }
        console.log(selectedAnnotationUIDs);
        const annotationUID = selectedAnnotationUIDs[0]["annotationUID"];
        const annotation = Anno.state.getAnnotation(annotationUID);

        console.log('4 coins :', annotation.data.handles.points);

        if (!annotation) {
            console.log('ici');
            return;
        }
        console.log(viewP)
        const viewport = viewP;
        const volumeActorInfo = viewport.getDefaultActor();

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

        CsToolsUtils.segmentation.thresholdVolumeByRange([annotation], [referenceVolume], segmentationRepresentation, {
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
        <button id='RectangleROIbuttonTool' onClick={onClickInit}>RectangleRoiTreshold</button>
        <div id='RectangleROItooldiv' style={{ visibility: 'hidden' }}>
            <div style={{ color: 'white' }}>
                <button onClick={onClickRender}>Execute threshold</button>
                <label id="labelSlices">Number of slices to Segment: 3</label>
                <input id='inputSlices' type='range' min='1' max='5' defaultValue='3' onChange={onSelectedChangeSlices}></input>

                <label id="labelLowerT">Lower Threshold: 100</label>
                <input id='inputLowerT' type='range' min='100' max='400' defaultValue='100' onChange={onSelectedChangeInputLowerT}></input>

                <label id="labelUpperT">Upper Threshold: 500</label>
                <input id='inputUpperT' type='range' min='500' max='1000' defaultValue='500' onChange={onSelectedChangeInputUpperT}></input></div>
        </div>

    </>)
}