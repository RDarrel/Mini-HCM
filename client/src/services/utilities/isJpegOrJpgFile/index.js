const isJpegOrJpgFile = file => {
  const fileType = file.type;
  return fileType === "image/jpeg" || fileType === "image/jpg";
};

export default isJpegOrJpgFile;
