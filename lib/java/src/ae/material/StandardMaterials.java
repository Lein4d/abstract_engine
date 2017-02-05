package ae.material;

import java.util.HashMap;
import java.util.Map;

import ae.core.AbstractEngine;
import ae.core.Texture;
import ae.math.Vector3D;

public final class StandardMaterials {
	
	private final class StandardMaterial {
		
		private final Material _material;
		private final boolean  _diffuse;
		private final boolean  _normalMap;
		private final boolean  _emissive;
		private final boolean  _colorMask;
		
		private StandardMaterial(
    			final boolean diffuse,
    			final boolean lighten,
    			final boolean normalMap,
    			final boolean emissive,
    			final boolean colorMask) {
			
			_diffuse   = diffuse;
			_normalMap = normalMap && lighten;
			_emissive  = emissive;
			_colorMask = colorMask;
			
			final MaterialBuilder mb           = new MaterialBuilder();
			Node                  curColorNode = null;
			
			if(diffuse) {
				mb.addTexture("diffuse");
				curColorNode = mb.textureRGB("diffuse");
			}
			
			if(lighten) {
				
				Node curLightNode = null;
				
				if(normalMap) {
					mb.addTexture("normal");
					curLightNode = mb.phong(mb.normalMapping(mb.normalTexture("normal")));
				} else {
					curLightNode = mb.phong();
				}
				
				curColorNode = curColorNode != null ?
					mb.mult(curColorNode, curLightNode) : curLightNode;
			}
			
			if(emissive) {
				
				mb.addTexture("emissive");
				
				curColorNode = curColorNode != null ?
					mb.add(curColorNode, mb.textureRGB("emissive")) :
					mb.textureRGB("emissive");
			}
			
			if(colorMask) {
				
				mb.addParameter("colorMask", GlslType.FLOAT3);
				
				curColorNode = curColorNode != null ?
					mb.mult(mb.param("colorMask"), curColorNode) :
					mb.param("colorMask");
			}
			
			mb.setColor(
				curColorNode != null ? curColorNode : mb.constF(1, 1, 1));
			
			_material = mb.createMaterial(
				engine,
				(diffuse ? "D" : "_") + (lighten ? "L" : "_") +
					(normalMap ? "N" : "_") + (emissive ? "E" : "_") +
					(colorMask ? "C" : "_"));
		}
		
		private final void _setColorMask(final Vector3D colorMask) {
			
			if(_colorMask) {
				colorMask.copyStaticValues();
				_material.setParam(
					"colorMask", colorMask.x, colorMask.y, colorMask.z);
			}
		}
		
		private final void _setTextures(final Textures textures) {
			
			if(_diffuse)   _material.setTexture("diffuse",  textures.diffuse);
			if(_normalMap) _material.setTexture("normal",   textures.normalMap);
			if(_emissive)  _material.setTexture("emissive", textures.emissive);
		}
	}
	
	public static final class Textures {
		
		public Texture diffuse;
		public Texture normalMap;
		public Texture emissive;
		
		public Textures(
    			final Texture diffuse,
    			final Texture normalMap,
    			final Texture emissive) {
			
			this.diffuse   = diffuse;
			this.normalMap = normalMap;
			this.emissive  = emissive;
		}
	}
	
	private static final int _BIT_DIFFUSE    = 0x01;
	private static final int _BIT_LIGHTEN    = 0x02;
	private static final int _BIT_NORMAL_MAP = 0x04;
	private static final int _BIT_EMISSIVE   = 0x08;
	private static final int _BIT_COLOR_MASK = 0x10;

	private final Map<Material, StandardMaterial>
		_materialsByBackend = new HashMap<>(64);
	private final StandardMaterial[] _materialsById = new StandardMaterial[32];
	
	public final AbstractEngine engine;
	
	public StandardMaterials(final AbstractEngine engine) {
		this.engine = engine;
	}
	
	public final Material get(
			final boolean diffuse,
			final boolean colorMask,
			final boolean lighten,
			final boolean normalMap,
			final boolean emissive) {
		
		int materialId = 0;
		
		if(diffuse)   materialId |= _BIT_DIFFUSE;
		if(colorMask) materialId |= _BIT_COLOR_MASK;
		if(lighten)   materialId |= _BIT_LIGHTEN;
		if(normalMap) materialId |= _BIT_NORMAL_MAP;
		if(emissive)  materialId |= _BIT_EMISSIVE;
		
		if(_materialsById[materialId] == null) {
			
			final StandardMaterial newMaterial = new StandardMaterial(
				diffuse, lighten, normalMap, emissive, colorMask);
			
			_materialsById[materialId] = newMaterial;
			_materialsByBackend.put(newMaterial._material, newMaterial);
		}
		
		return _materialsById[materialId]._material;
	}
	
	public final boolean isStandard(final Material material) {
		return _materialsByBackend.containsKey(material);
	}
	
	public final boolean setMaterialData(
		 	final Material material,
		 	final Textures textures,
		 	final Vector3D colorMask) {
		
		final StandardMaterial sMaterial =
			_materialsByBackend.getOrDefault(material, null);
		
		if(sMaterial == null) return false;
		
		if(textures  != null) sMaterial._setTextures (textures);
		if(colorMask != null) sMaterial._setColorMask(colorMask);
		
		return true;
	}
}
