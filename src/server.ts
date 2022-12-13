import app, { initialize_server } from "@/app";

const port = +process.env.PORT || 4000;

initialize_server().then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}.`);
  });
});
