import { getRenderingEngine, CONSTANTS } from '@cornerstonejs/core';
import { Enums as csEnums, ToolGroupManager, CrosshairsTool } from '@cornerstonejs/tools';
import $ from 'jquery'

export default ({ toolGroupId, vId1, vId2, vId3 }) => {

    const viewportColors = {
        [vId1]: 'rgb(200, 0, 0)',
        [vId2]: 'rgb(200, 200, 0)',
        [vId3]: 'rgb(0, 200, 0)',
    };

    const viewportReferenceLineControllable = [
        vId1,
        vId2,
        vId3,
    ];

    const viewportReferenceLineDraggableRotatable = [
        vId1,
        vId2,
        vId3,
    ];

    const viewportReferenceLineSlabThicknessControlsOn = [
        vId1,
        vId2,
        vId3,
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

    const activateCrosshair = () => {
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);

        const Activatedtool = toolGroup.getActivePrimaryMouseButtonTool();
        toolGroup.setToolDisabled(Activatedtool);

        toolGroup.addTool(CrosshairsTool.toolName, {
            getReferenceLineColor,
            getReferenceLineControllable,
            getReferenceLineDraggableRotatable,
            getReferenceLineSlabThicknessControlsOn,
        });

        toolGroup.setToolActive(CrosshairsTool.toolName, {
            bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
        });

    }

    return (
        <>
            <button id='button-crosshair' onClick={activateCrosshair}>CrossHair</button>
        </>
    )
}