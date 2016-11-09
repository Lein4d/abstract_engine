package ae.demo;

import static org.lwjgl.glfw.GLFW.*;

import ae.core.AbstractEngine;
import ae.core.InputListener;
import ae.core.SceneGraph;
import ae.core.Texture;
import ae.entity.DirectionalLight;
import ae.entity.Model;
import ae.math.Vector4D;
import ae.mesh.Meshes;

public final class Triangle {
	
	public static void main(
			final String[] args) {
		
		// The engine and a scenegraph are the basic components
		final AbstractEngine engine     = new AbstractEngine("Triangle");
		final SceneGraph     sceneGraph = new SceneGraph();
		
		// A checker texture can be used to verify the texture coordinates
		final Texture checkerTexture =
			Texture.createCheckerTexture(Vector4D.WHITE, Vector4D.GREY);
		
		// A triangle can be created by creating a disc with 3 edges
		final Model triangle = new Model(sceneGraph).
			setMesh(Meshes.createDisc(3).createMesh()).
			setTexture(checkerTexture).
			setUpdater((model, time, delta) -> {
				model.transformation.getValue().
					toIdentity().
					translate(0, 0, -4).
					rotateZ((float)time / 200f).
					rotateX(90);
			});
		
		// Right now, the light is neccessary to make the triangle visible
		final DirectionalLight light = new DirectionalLight(sceneGraph).
			makeAmbient();
		
		// Set light parameters
		light.color    .getValue().setData(Vector4D.WHITE.xyz);
		light.direction.getValue().setData(0, 0, 1);
		
		// Add the triangle and the light source to the scenegraph
		// Both entities will be children of the root entity
		sceneGraph.root.addChild(triangle);
		sceneGraph.root.addChild(light);
		
		// Make the background black
		engine.background.setData(Vector4D.BLACK.xyz);
		
		// Attach the scenegraph to the engine
		engine.setSceneGraph(sceneGraph);
	
		// React to keyboard input
		engine.setInputListener(new InputListener() {
			
			@Override
			public final void onKeyDown(
					final int key) {
				
				switch(key) {
					case GLFW_KEY_ESCAPE: engine.stop();             break;
					case GLFW_KEY_T:      engine.toggleFullscreen(); break;
					case GLFW_KEY_0:      engine.setSpeed(0);        break;
					case GLFW_KEY_1:      engine.setSpeed(0.5);      break;
					case GLFW_KEY_2:      engine.setSpeed(1);        break;
					case GLFW_KEY_3:      engine.setSpeed(2);        break;
				}
			}
		});
		
		// Recompute the projection matrix on window resize
		engine.setResizeCallback((eng) -> {
			engine.projection.toIdentity().projectPerspectiveHorFOV(
				engine.getFramebufferWidth(), engine.getFramebufferHeight(),
				60, 2);
		});
		
		// Begin rendering
		engine.start();
	}
}
