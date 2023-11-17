function Fallback({ error, resetErrorBoundary }) {
  //? i can Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <div className="flex h-full w-full items-center justify-center border-2 border-red-700 text-black dark:text-white">
      <div role="alert">
        <p>Something went Wrong in this side of the UI:</p>
        <pre style={{ color: 'red' }}>{error.message}</pre>
      </div>
    </div>
  )
}

export default Fallback
