export default async function HabidIdPage({ params }: { params: { habitId: string } }) {
    const value = await params; // Access the parameter by its key
    // console.log(value);

    // URL -> /next-page?keyName=someValue
    // value -> 'someValue'
    return <p>Value: {value.habitId}</p>;
}