interface props{
    text: string
}
const LoadingComponent = ({text}:props) => {
  return (
    <div className="loading">
      {text}
    </div>
  )
}

export default LoadingComponent
