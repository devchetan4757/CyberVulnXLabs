export default function DockerInfo() {
  return (
    <section className="docker-info">
      <h2 className="post-title">What Is Docker?</h2>

      <p className="post-paragraph">
        Docker is a platform for running applications inside lightweight,
        isolated environments called containers. A container packages an
        application together with everything it needs to run — code,
        runtime, system libraries, and configuration — so it behaves the
        same way no matter what machine it ends up running on.
      </p>

      <p className="post-paragraph">
        Unlike a full virtual machine, a container doesn't carry its own
        operating system. It shares the host machine's kernel but keeps its
        own filesystem, processes, and network completely separate from the
        host. That's what makes containers fast to start, cheap to throw
        away, and safe to experiment in — if something goes wrong inside a
        container, the host system itself is left untouched.
      </p>

      <h3 className="section-title">How a Container Gets Created</h3>

      <p className="post-paragraph">
        Every container starts from an <b>image</b> — a read-only blueprint
        that defines the base operating system, installed packages, and
        startup instructions. Images are usually built from a{" "}
        <b>Dockerfile</b>, a plain-text recipe of setup steps. Running{" "}
        <code>docker build</code> turns that recipe into an image, and{" "}
        <code>docker run</code> spins up a live, writable container from it.
        Once the container is removed, every change made inside it
        disappears too, leaving the original image exactly as it was.
      </p>

      <h3 className="section-title">Commands You'll See in This Lab</h3>

      <p className="post-paragraph">
        <code>docker build</code> → create an image from a Dockerfile
        <br />
        <code>docker run</code> → start a new container from an image
        <br />
        <code>docker ps</code> → list currently running containers
        <br />
        <code>docker exec</code> → run a command inside a running container
        <br />
        <code>docker images</code> → list images stored on the host
      </p>

      <h3 className="section-title">Why Labs Use Docker</h3>

      <p className="post-paragraph">
        Security labs like this one rely on containers to create disposable,
        isolated Linux environments on demand. Instead of risking a real
        machine, suspicious files, exploits, or commands can be run inside a
        container that can be torn down and rebuilt in seconds. That
        isolation is exactly what lets you safely "detonate" an unknown file
        and study what it does, without putting anything outside the
        container at risk.
      </p>
    </section>
  );
}
