export function Error({
  children,
  onRetry,
}: {
  children: string;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        fontSize: "small",
        backgroundColor: "lemonchiffon",
        color: "red",
        margin: "0 -.5em",
        padding: ".5em 1em",
      }}
    >
      {children}
      <button
        style={{
          padding: ".25em .5em",
          margin: "0 .5em",
          background: "white",
          border: "1px solid red",
        }}
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}
