package com.medora.hospital.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "seed_markers")
public class SeedMarker {

    @Id
    private String id;
    private String key;
    private boolean seeded;

    public SeedMarker() {
    }

    public SeedMarker(String key, boolean seeded) {
        this.key = key;
        this.seeded = seeded;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public boolean isSeeded() {
        return seeded;
    }

    public void setSeeded(boolean seeded) {
        this.seeded = seeded;
    }
}
