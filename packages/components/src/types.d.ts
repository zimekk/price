declare module "*.png";

declare module "*.scss" {
  const styles: { [className: string]: string };
  export default styles;
}

declare module "*.svg" {
  const asset: { src: string };
  export default asset;
}
