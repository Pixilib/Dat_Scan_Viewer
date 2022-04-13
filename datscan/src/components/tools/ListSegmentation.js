import { getRenderingEngine, CONSTANTS } from '@cornerstonejs/core';
import { ToolGroupManager, BrushTool, RectangleScissorsTool, CircleScissorsTool, SphereScissorsTool, Enums as csEnums } from '@cornerstonejs/tools';
import $ from 'jquery'

export default ({ toolGroupId }) => {

    const changeTool = () => {
        const toolName = $('#segmentation-select option:selected').text();
        const tools = [BrushTool.toolName, RectangleScissorsTool.toolName, CircleScissorsTool.toolName, SphereScissorsTool.toolName]

        const toolGroup = ToolGroupManager.getToolGroup(toolGroupId)

        tools.forEach(tool => {
            toolGroup.setToolDisabled(tool);
        });

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

            default:
                throw new Error('undefined tool option');
        }

    }




    return (
        <>
            <select name="tools" id="segmentation-select" defaultValue={'Brush'} onChange={changeTool}>
                <option>Brush</option>
                <option>RectangleScissor</option>
                <option>CircleScissor</option>
                <option >SphereScissor</option>
            </select>
        </>
    )
}