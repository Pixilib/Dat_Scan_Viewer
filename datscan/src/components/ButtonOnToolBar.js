export default ({ title, onClick }) => {

    return (
        <>
            <button id="buttonToolBar" onClick={onClick}>{title}</button>
        </>
    )
}