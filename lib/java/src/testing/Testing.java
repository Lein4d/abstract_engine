package testing;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.SceneGraph;
import ae.core.Texture;
import ae.core.TextureBuilder;
import ae.material.GlslType;
import ae.material.Material;
import ae.material.MaterialBuilder;
import ae.math.Matrix4D;
import ae.math.SignedAxis;
import ae.math.Vector4D;
import ae.mesh.FileFormat;
import ae.mesh.Meshes;
import ae.scenegraph.Entity;
import ae.scenegraph.entities.Camera;
import ae.scenegraph.entities.DirectionalLight;
import ae.scenegraph.entities.DynamicSpace;
import ae.scenegraph.entities.Marker;
import ae.scenegraph.entities.Model;
import ae.scenegraph.entities.PointLight;
import ae.util.Wrapper;

public final class Testing {
	
	public static final void main(final String[] args) {
		
		final AbstractEngine engine = new AbstractEngine(
			"Abstract Engine " + AbstractEngine.VERSION_STRING,
			null, null, true, 10);
		
		final SceneGraph sceneGraph = new SceneGraph(engine);
		
		final Texture diffuse = new TextureBuilder().
			setData("data/floor_d.jpg").
			setFiltering(true, true, true, true, 16).
			createTexture();
		final Texture normal = new TextureBuilder().
			setData("data/floor_n.jpg").
			setFiltering(true, true, true, true, 16).
			createTexture();
		final Texture bump = new TextureBuilder().
			setData("data/floor_h.jpg").
			setFiltering(true, true, false, false, 0).
			createTexture();
		
		final MaterialBuilder mb = new MaterialBuilder();
		final Material testMaterial = mb.
			addTexture("diffuse").
			addTexture("normal").
			addTexture("bump").
			addParameter("height", GlslType.FLOAT).
			addValue("tcMod", GlslType.FLOAT2, mb.parallax("bump", mb.param("height"))).
			setColor(mb.mult(
				mb.phong(mb.normalMapping(mb.normalTexture("normal", mb.value("tcMod")))),
				mb.textureRGB("diffuse", mb.value("tcMod")))).
			createMaterial(engine, "Parallax");
		
		final Camera cameraGlobal = new Camera(sceneGraph, null).
			setProjectionMode(
				new Camera.AdaptiveFOV().setMinHorFOV(Camera.RATIO_SQUARE, 30));

		final Camera cameraLocal = new Camera(sceneGraph, null).
			setProjectionMode(
				new Camera.AdaptiveFOV().setMinHorFOV(Camera.RATIO_16_9, 60));

		final Marker originMarker = new Marker(sceneGraph, "marker_o");
		final Marker torusMarker  = new Marker(sceneGraph, "marker_t");
		
		final DynamicSpace cameraSpace = new DynamicSpace(sceneGraph, "cam_space").
			setOrigin         (originMarker).
			setViewFocus      (torusMarker).
			setViewAxisMapping(SignedAxis.Z_NEG);
		
		final Model refCube = new Model(sceneGraph, "ref_cube").
			setMesh(Meshes.createCube(20, true).
				transformTexCoords(new Matrix4D().scale(2)).
				invertFaceOrientation().
				createMesh()).
			setMaterial(
				engine.standardMaterials.get(true, false, false, false, false)).
			setDiffuseTexture(
				Texture.createCheckerTexture(Vector4D.WHITE, Vector4D.GREY));
		
		final Model quad = new Model(sceneGraph, "quad").
			setMesh(Meshes.createQuad(8, true).createMesh()).
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					rotateY(event.getTimeF() / 200f);
			});
		
		final Model cube = new Model(sceneGraph, "cube").
			setMesh(Meshes.createCube(2, true).createMesh()).
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					translate(-2, 2, -2).
					rotateX(event.getTimeF() / 200f);
			});
		
		final Model torus = new Model(sceneGraph, "torus").
			setMesh(
				Meshes.createTorus(64, 32, 1, 0.5f, 0.5f, false).
					transformTexCoords(new Matrix4D().scale(2, 1, 1)).createMesh()).
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					translate(2, 2, 2).
					rotateY(event.getTimeF() / 70f).
					rotateZ(event.getTimeF() / 100f).
					rotateX(event.getTimeF() / 200f);
			});
		/*
		final Model imported = FileFormat.load("data/ship.stl").
			toSingleModel(sceneGraph).
			setMaterial(
				engine.standardMaterials.get(false, false, true, false, false));
		*/
		
		final Entity<? extends Entity<?>> imported =
			FileFormat.load("data/sherry.obj").toNestedEntity(
    			sceneGraph,
    			"import",
    			(model) -> {
    				model.setMaterial(
    					engine.standardMaterials.get(true, false, true, false, false));
    				model.setDiffuseTexture(
    					Texture.createCheckerTexture(Vector4D.WHITE, Vector4D.GREY));
    			});
		
		imported.setUpdateCallback((event) ->
			event.host.transformation.getValue().toIdentity().
				// scale(0.8f).translate(0, 2, 0) // airboat
    			scale(0.3f).rotateX(-90) // sherry
    	);
		
		final DirectionalLight ambLight = new DirectionalLight(sceneGraph, "amb").
			makeAmbient();
		
		final PointLight pointLightRed = new PointLight(sceneGraph, "red").
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					rotateY(event.getTimeF() / 50f).
					translate(2, 1, 0);
			}).
			setRange(4).makeLinear();
		
		final PointLight pointLightGreen = new PointLight(sceneGraph, "green").
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					rotateY(event.getTimeF() / 50f + 120).
					translate(2, 1, 0);
			}).
			setRange(4).makeLinear();

		final PointLight pointLightBlue = new PointLight(sceneGraph, "blue").
			setUpdateCallback((event) -> {
				event.host.transformation.getValue().
					toIdentity().
					rotateY(event.getTimeF() / 50f + 240).
					translate(2, 1, 0);
			}).
			setRange(4).makeLinear();
		
		sceneGraph.onNewTopology.addListener((event) -> event.host.print());
		
		cameraLocal.transformation.getValue().
			translate(-5, 3, 5).
			rotateY(-45).
			rotateX(-20);
		
		refCube.transformation.getValue().
			translate(0, 0, -12).
			rotateX(45);
		
		quad .setMaterial(testMaterial);
		cube .setMaterial(testMaterial);
		torus.setMaterial(testMaterial);
		
		testMaterial.setTexture("diffuse", diffuse);
		testMaterial.setTexture("normal",  normal);
		testMaterial.setTexture("bump",    bump);
		testMaterial.setParam  ("height",  0.05f);
		
		ambLight.color.getValue().setData(0.1f, 0.1f, 0.1f);
		ambLight.direction.getValue().setData(0, 1, 0);
		
		pointLightRed.color.getValue().setData(1, 0.3f, 0.3f);
		pointLightGreen.color.getValue().setData(0.3f, 1, 0.3f);
		pointLightBlue.color.getValue().setData(0.3f, 0.3f, 1);
		
		sceneGraph.root.addChild(refCube);
		sceneGraph.root.addChild(originMarker);
		sceneGraph.root.addChild(cameraSpace);
		
		refCube.addChild(quad);
		
		quad.addChild(imported);
		quad.addChild(cameraLocal);
		quad.addChild(cube);
		quad.addChild(torus);
		quad.addChild(ambLight);
		quad.addChild(pointLightRed);
		quad.addChild(pointLightGreen);
		quad.addChild(pointLightBlue);
		
		torus.addChild(torusMarker);
		
		cameraSpace.addChild(cameraGlobal);
		
		engine.background.setData(0.5f, 0, 0);
		engine.display.split(1, 2, cameraGlobal, cameraLocal);
		//engine.display.setCamera(cameraLocal);
		
		sceneGraph.print();
		
		final Wrapper<Integer> materialHeightState = new Wrapper<Integer>(2);
		
		engine.state.onNewFrame.addListener((event) ->
			engine.setTitle(
				"Abstract Engine " + AbstractEngine.VERSION_STRING +
				" (" + event.host.getFPS() + " FPS)"));
		
		engine.input.onKeyDown.addListener((event) -> {
			
			switch(event.getKey()) {
				case GLFW_KEY_ESCAPE: engine.stop(); break;
				case GLFW_KEY_T: engine.fullscreen.toggle(); break;
				case GLFW_KEY_0: engine.setSpeed(0); break;
				case GLFW_KEY_1: engine.setSpeed(0.5); break;
				case GLFW_KEY_2: engine.setSpeed(1); break;
				case GLFW_KEY_3: engine.setSpeed(2); break;
				
				case GLFW_KEY_H:
					materialHeightState.v = (materialHeightState.v + 1) % 3;
					testMaterial.setParam(
						"height", materialHeightState.v * 0.025f);
					break;
			}
		});
		
		engine.input.onMouseLeaveInstance.addListener((event) ->
			System.out.println("Leave: " + event.host.getModel().name));

		engine.input.onMouseEnterInstance.addListener((event) ->
			System.out.println("Enter: " + event.host.getModel().name));
		
		engine.start();
	}
}
