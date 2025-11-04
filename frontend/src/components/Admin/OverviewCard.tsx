
interface props{
    title: string;
    value: number;
}
function OverviewCard({title, value}:props){
    return <div className="card">
        <h3 className="card-title">{title}</h3>
        <div className="card-value">{value}</div>
    </div>
}

export default OverviewCard