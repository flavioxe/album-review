export function navigateBack(navigate, fallback = "/") {
  const hasPreviousEntry = Boolean(
    window.history.state && window.history.state.idx > 0,
  );

  if (hasPreviousEntry) {
    navigate(-1);
  } else {
    navigate(fallback);
  }
}
