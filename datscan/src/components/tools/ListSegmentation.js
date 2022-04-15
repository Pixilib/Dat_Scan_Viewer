import { getRenderingEngine, CONSTANTS } from '@cornerstonejs/core';
import { ToolGroupManager, BrushTool, RectangleScissorsTool, CircleScissorsTool, SphereScissorsTool, Enums as csEnums } from '@cornerstonejs/tools';
import $ from 'jquery'

export default ({ toolGroupId }) => {

    const changeTool = () => {
        const toolName = $('#segmentation-select option:selected').text();
        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)

        const activeTool = toolGroup.getActivePrimaryMouseButtonTool();
        toolGroup.setToolDisabled(activeTool);


        switch (toolName) {
            case 'Brush':
                toolGroup.setToolActive(toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
                });
                break;

            case 'RectangleScissor':
                toolGroup.setToolActive(toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
                });
                break;

            case 'CircleScissor':
                toolGroup.setToolActive(toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
                });
                break;

            case 'SphereScissor':
                toolGroup.setToolActive(toolName, {
                    bindings: [{ mouseButton: csEnums.MouseBindings.Primary }],
                });
                break;
        }

    }




    return (
        <>
            <select name="tools" id="segmentation-select" defaultValue={'Sélectionner un type'} onChange={changeTool}>
                <option>Sélectionner un type</option>
                <option>Brush</option>
                <option>RectangleScissor</option>
                <option>CircleScissor</option>
                <option >SphereScissor</option>
            </select>
        </>
    )
}