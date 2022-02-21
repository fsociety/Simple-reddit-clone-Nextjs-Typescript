import md5 from 'md5'

export default function Gravatar(props) {
    return (
        <>
        <img src={`https://www.gravatar.com/avatar/${ md5(props.src) }?s=${props.size}&d=monsterid`} className="rounded-full" />
        </>
    )
}
